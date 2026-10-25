#!/usr/bin/env bash
# One-time Google Cloud setup for Luma on Cloud Run (docs/deployment.md#cloud-run).
# Safe to run again: every step skips or repeats harmlessly what already exists.
#
#   PROJECT=luma-prod GITHUB_REPO=owner/calcul-colonnes deploy/setup-gcp.sh
#
# Optional: MIN_INSTANCES (1: one warm instance), REGISTRATION (invite for
# friends and family), PRIVACY_HOSTING and PRIVACY_CONTACT (the privacy page),
# REGION (default europe-west1), PUBLIC_URL (default: the service's
# run.app address, until the domain is mapped), and the sign-in providers'
# client ids (GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID, GITHUB_CLIENT_ID,
# OIDC_CLIENT_ID with OIDC_ISSUER, OIDC_ID, OIDC_NAME): their secrets are asked
# for and kept in Secret Manager. Secrets are typed, never passed as arguments.
#
# Needs: gcloud, signed in with an account that owns the project.
set -euo pipefail

: "${PROJECT:?set PROJECT, the Google Cloud project id}"
: "${GITHUB_REPO:?set GITHUB_REPO, as owner/name}"
REGION="${REGION:-europe-west1}"
PUBLIC_URL="${PUBLIC_URL:-}"

cd "$(dirname "$0")/.."
gcloud config set project "$PROJECT" >/dev/null
RUNTIME="luma-runtime@$PROJECT.iam.gserviceaccount.com"
DEPLOYER="luma-deployer@$PROJECT.iam.gserviceaccount.com"
PLACEHOLDER=us-docker.pkg.dev/cloudrun/container/hello # until the first release

exists() { "$@" >/dev/null 2>&1; }
step() { printf '\n== %s\n' "$*"; }

step "APIs"
gcloud services enable cloudresourcemanager.googleapis.com iam.googleapis.com \
  run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com \
  iamcredentials.googleapis.com sts.googleapis.com
NUMBER=$(gcloud projects describe "$PROJECT" --format='value(projectNumber)')

step "Image repository (europe, ten most recent images kept)"
exists gcloud artifacts repositories describe luma --location "$REGION" ||
  gcloud artifacts repositories create luma --repository-format=docker --location "$REGION"
gcloud artifacts repositories set-cleanup-policies luma --location "$REGION" \
  --policy=deploy/cleanup-policy.json --no-dry-run >/dev/null

step "Service accounts: luma-runtime (the app), luma-deployer (GitHub Actions)"
for sa in luma-runtime luma-deployer; do
  exists gcloud iam service-accounts describe "$sa@$PROJECT.iam.gserviceaccount.com" ||
    gcloud iam service-accounts create "$sa"
done
for role in roles/run.admin roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$DEPLOYER" \
    --role="$role" --condition=None >/dev/null
done
gcloud iam service-accounts add-iam-policy-binding "$RUNTIME" \
  --member="serviceAccount:$DEPLOYER" --role=roles/iam.serviceAccountUser >/dev/null

step "Secrets (Secret Manager, readable by luma-runtime only)"
# secret NAME PROMPT: creates it from a typed value if missing, and lets
# luma-runtime read it. Returns 1 when skipped; a gcloud failure stops the script
# (set -e does not apply inside a function called from `if` or `||`).
secret() {
  local name=$1 value
  if ! exists gcloud secrets describe "$name"; then
    read -r -s -p "$2 (empty to skip): " value
    echo
    [ -n "$value" ] || { echo "$name: skipped"; return 1; }
    printf '%s' "$value" | gcloud secrets create "$name" --data-file=- >/dev/null ||
      { echo "$name: could not be created" >&2; exit 1; }
    echo "$name: created"
  else
    echo "$name: exists (change it with: gcloud secrets versions add $name --data-file=-)"
  fi
  gcloud secrets add-iam-policy-binding "$name" --member="serviceAccount:$RUNTIME" \
    --role=roles/secretmanager.secretAccessor >/dev/null ||
    { echo "$name: luma-runtime could not be given access" >&2; exit 1; }
}
secret database-url "Neon pooled connection string for production (postgresql://…)" ||
  { echo "DATABASE_URL is required"; exit 1; }
SECRETS="DATABASE_URL=database-url:latest"
ENV_VARS="TRUST_PROXY=true"
for provider in GOOGLE MICROSOFT GITHUB OIDC; do
  id_var="${provider}_CLIENT_ID"
  [ -n "${!id_var:-}" ] || continue
  name="$(tr '[:upper:]' '[:lower:]' <<<"$provider")-client-secret"
  if secret "$name" "$provider client secret"; then
    SECRETS="$SECRETS,${provider}_CLIENT_SECRET=$name:latest"
    ENV_VARS="$ENV_VARS,$id_var=${!id_var}"
  fi
done
for var in OIDC_ISSUER OIDC_ID OIDC_NAME OIDC_SCOPES MICROSOFT_TENANT REGISTRATION SESSION_DAYS PRIVACY_HOSTING PRIVACY_CONTACT; do
  [ -n "${!var:-}" ] && ENV_VARS="$ENV_VARS,$var=${!var}"
done

step "GitHub Actions → Google, without keys (Workload Identity Federation, $GITHUB_REPO only)"
exists gcloud iam workload-identity-pools describe github --location=global ||
  gcloud iam workload-identity-pools create github --location=global --display-name="GitHub Actions"
exists gcloud iam workload-identity-pools providers describe github --location=global --workload-identity-pool=github ||
  gcloud iam workload-identity-pools providers create-oidc github --location=global \
    --workload-identity-pool=github --issuer-uri=https://token.actions.githubusercontent.com \
    --attribute-mapping=google.subject=assertion.sub,attribute.repository=assertion.repository \
    --attribute-condition="assertion.repository=='$GITHUB_REPO'"
gcloud iam service-accounts add-iam-policy-binding "$DEPLOYER" --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$GITHUB_REPO" >/dev/null

step "Service luma and job luma-maintenance (placeholder image until the first release)"
created=false
if ! exists gcloud run services describe luma --region "$REGION"; then
  gcloud run deploy luma --image "$PLACEHOLDER" --region "$REGION" --service-account "$RUNTIME" \
    --allow-unauthenticated --max-instances=1 --cpu-boost --memory=512Mi \
    --set-secrets="$SECRETS" --set-env-vars="$ENV_VARS" --quiet
  created=true
fi
URL=$(gcloud run services describe luma --region "$REGION" --format='value(status.url)')
# PUBLIC_URL: the one given, or the run.app address for a new service. A second
# run without PUBLIC_URL leaves the current one alone (a mapped domain, say).
if [ -n "$PUBLIC_URL" ]; then
  ENV_VARS="$ENV_VARS,PUBLIC_URL=$PUBLIC_URL"
elif [ "$created" = true ]; then
  ENV_VARS="$ENV_VARS,PUBLIC_URL=$URL"
fi
gcloud run services update luma --region "$REGION" --quiet \
  --update-secrets="$SECRETS" --update-env-vars="$ENV_VARS" >/dev/null
# MIN_INSTANCES=1 keeps one instance warm (no cold start, about $10 a month).
# Service-level (--min), not per revision: a release's tagged candidate
# revision does not get a warm instance of its own. 0 (or "default") stops it.
if [ -n "${MIN_INSTANCES:-}" ]; then
  gcloud run services update luma --region "$REGION" --quiet --min "$MIN_INSTANCES" >/dev/null
fi
if ! exists gcloud run jobs describe luma-maintenance --region "$REGION"; then
  gcloud run jobs create luma-maintenance --image "$PLACEHOLDER" --region "$REGION" \
    --service-account "$RUNTIME" --set-secrets="DATABASE_URL=database-url:latest" \
    --command=node --args=dist-server/index.js,maintenance --max-retries=0 --task-timeout=10m --quiet
fi

step "Done. Set these in GitHub (Settings › Secrets and variables › Actions)"
cat <<EOF
Variables:
  GCP_PROJECT       $PROJECT
  GCP_REGION        $REGION
  GCP_WIF_PROVIDER  projects/$NUMBER/locations/global/workloadIdentityPools/github/providers/github
  GCP_DEPLOYER      $DEPLOYER
  NEON_PROJECT_ID   (Neon console › Settings › Project ID)
Secret:
  NEON_API_KEY      (Neon console › Account settings › API keys)

The service answers at $URL.
Next: push a version tag to release, then map the domain (docs/deployment.md#custom-domain).
EOF
