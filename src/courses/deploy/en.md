# Deployment systems — a complete course

## How to use this course

This course explains how software gets from a commit to production and stays healthy there: pipelines and artifacts, containers, release strategies, infrastructure as code with Terraform, Kubernetes, GitOps and managed platforms such as Cloud Run, and the operations that keep it all running. It describes the tools as they are in late 2026, and favours principles that outlast any one tool.

**Who it is for.** Developers who ship code and want to understand what happens after the merge, and anyone setting up or reviewing a delivery pipeline. You should be comfortable with Git and a terminal; Part 5 assumes some cloud vocabulary (projects, regions, service accounts).

**How it is organised.** Eight parts in two blocks:

| Block | Parts | What you can do after it |
|---|---|---|
| Foundations | 1 Pipelines and artifacts · 2 Containers · 3 Release strategies | Build once, ship safely, roll back in seconds |
| Tools and operations | 4 Infrastructure as code · 5 Terraform and OpenTofu · 6 Kubernetes · 7 GitOps and managed platforms · 8 Operations | Describe infrastructure in code, run it on Kubernetes or Cloud Run, and keep it reliable |

Each part ends with what to remember. The exercises at the end give one task per part, with answers.

**With Luma.** The *🚀 Déploiement* test in Luma's *Informatique* group follows the same topics at four levels (Débutant to Expert), with 128 written questions. Luma itself is deployed the way Part 7 describes: an image built by GitHub Actions, migrations run as a separate job, a tagged no-traffic revision on Cloud Run tested before traffic moves.

**What you need.** Docker or Podman for Part 2; Terraform or OpenTofu and a cloud account (a free tier is enough) for Part 5; for Part 6, a local cluster such as kind or minikube.

## Part 1 — Pipelines and artifacts

### CI, continuous delivery, continuous deployment

- **Continuous integration** merges small changes often, each built and tested automatically.
- **Continuous delivery** keeps the result always releasable; a person decides when to ship.
- **Continuous deployment** ships every change that passes the pipeline, with automated checks and progressive rollout as the gate.

The aim is the same throughout: small changes, fast feedback, and releases that are routine rather than events.

### Build once, deploy many

The pipeline turns a commit into an **artifact** once (a container image, a package, a binary), stores it in a registry under a version or a digest, and deploys that same artifact to each environment. Rebuilding for production could pull other dependencies and ship something nobody tested.

What differs between environments is **configuration**, read from the environment at run time: an environment variable such as `DATABASE_URL`, and secrets from a secret manager. That is the twelve-factor rule of config in the environment.

Name artifacts by what they are, not by where they are: a version (`1.4.0`) or the commit SHA, plus the digest for machines. `latest` says nothing in a deploy record.

### A pipeline that gives fast feedback

1. Lint, compile, unit tests: seconds to a few minutes, run on every push.
2. Build the artifact and scan it.
3. Integration and end-to-end tests against real services.
4. Deploy to staging, run smoke tests.
5. Promote to production, progressively, with automatic checks.

Order by cost and run independent stages in parallel. A manual approval before production should look at risk (what changed, migrations, timing), not re-read the code.

### Trunk, previews and reproducibility

- **Trunk-based development**: changes reach `main` at least daily, unfinished work behind feature flags, so every deploy is small.
- **Preview environments**: a short-lived deployment per pull request, at its own URL, removed when the pull request closes.
- **Reproducible builds**: pinned dependencies and toolchains give bit-for-bit identical artifacts. **Hermetic builds** go further: all inputs declared by hash, no network during the build.
- **SLSA** grades the trust in a build's origin; at higher levels the build platform signs provenance that the build steps cannot forge. **Signed images**, checked at deploy time, ensure only your pipeline's artifacts run.

### Migrations are a separate step

Code rollouts run old and new versions side by side for minutes; schema changes are often one-way. Run migrations as their own step before the code, and keep each migration compatible with the code before and after it (Part 3).

**What to remember.** One immutable artifact per commit, promoted through environments; configuration and secrets from the environment; fast checks first; migrations apart from code.

## Part 2 — Containers

### Containers, images, registries

A **container** is a set of processes isolated by the kernel (namespaces for what it sees, cgroups for what it uses); it shares the host's kernel, so it starts in milliseconds but isolates less than a virtual machine. An **image** is the read-only template a container starts from; a **registry** (Artifact Registry, GitHub Container Registry, Docker Hub) stores images by name, tag and digest.

### A good Dockerfile

```dockerfile
FROM node:22 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
CMD ["node", "dist/server.js"]
```

- **Layer order**: dependencies change rarely, code often, so copy the manifests and install before copying the code. A `.dockerignore` keeps `node_modules` and `.git` out of the build context.
- **Multi-stage**: compilers and sources stay in the build stage; the final image holds only what runs.
- **Non-root**: `USER node` limits what an exploit can do.
- **Exec form**: `CMD ["node", ...]` makes the app PID 1, so it receives SIGTERM and can shut down cleanly.

### Tags and digests

A tag such as `app:1.4` can be moved; a digest such as `app@sha256:9f…` always names the same bytes. People read tags; deployments should pin digests. Platforms record the digest they resolved.

### Smaller and safer images

- **Minimal or distroless bases** drop the shell and package manager: fewer vulnerabilities, but debugging relies on logs and debug variants.
- **Scanning** finds known vulnerabilities; rebuild regularly on updated bases rather than patching running containers.
- **Multi-architecture images**: `docker buildx build --platform linux/amd64,linux/arm64` produces an index that each machine pulls from.
- **Build secrets**: a file deleted in a later layer still exists in the earlier one. Use `RUN --mount=type=secret,id=npm ...` so the secret never enters a layer.

### Under the hood

Images follow the **OCI** format: a manifest lists a config and layers by digest, and an index groups manifests per platform. Kubernetes talks to a runtime such as containerd, which uses runc (or gVisor, Kata Containers) to create containers. Cloud Run's first generation sandbox used gVisor; the second generation runs a full Linux kernel in a microVM.

**What to remember.** Order layers for the cache, build in stages, run as non-root in exec form, pin digests, rebuild often on small bases, and keep secrets out of layers.

## Part 3 — Release strategies

### The four basic strategies

| Strategy | How | Rollback | Cost |
|---|---|---|---|
| Recreate | Stop the old version, start the new | Redeploy the old | Downtime |
| Rolling | Replace instances a few at a time | Roll the old version back in | Both versions live for a while |
| Blue-green | Start the new beside the old, switch all traffic at once | Switch back | Double capacity during the switch |
| Canary | Send a small share of traffic to the new, grow it step by step | Send traffic back | Needs metrics and traffic splitting |

### Feature flags and probes

**Feature flags** separate deploying from releasing: code ships switched off and is turned on for some users or everyone without a deploy, and switched off in seconds if it misbehaves. Remove old flags.

**Probes** keep bad instances out of traffic: a failing **readiness** probe removes an instance from load balancing; a failing **liveness** probe restarts it. A rollout whose new instances never become ready stalls instead of serving errors.

### Canaries in practice

On Cloud Run, deploy without traffic, then move it:

```sh
gcloud run deploy web --image="$IMAGE" --no-traffic --tag=candidate
gcloud run services update-traffic web --to-tags=candidate=10
gcloud run services update-traffic web --to-latest
```

Watch error rate and latency against the old version at each step. **Automated canary analysis** (Argo Rollouts, Flagger) compares canary and baseline statistically and rolls back on its own. Route by user when a session spans several requests, so each user sees one version.

### Databases: expand and contract

To rename a column without downtime:

1. **Expand**: add the new column.
2. Write both columns, and backfill old rows.
3. Switch reads to the new column.
4. Stop writing the old one.
5. **Contract**: drop the old column.

Each step works with the code before and after it, so every deploy can roll back. The same applies to message formats in queues and to cached data: make readers tolerant first, then change writers.

### Roll back or roll forward

Roll back by default when the cause is unclear: it restores a known state fast. Roll forward when the new version has already changed data the old one cannot read, and a small fix can go through the normal pipeline.

### Larger systems

- **Shadow traffic** copies real requests to the new version and compares responses without returning them; side effects must be disabled in the shadow.
- **Cells** split the system into independent copies serving slices of users; releases go cell by cell, region by region.
- **Bake time** between stages catches slow problems: leaks, daily jobs, peak hours.

**What to remember.** Separate deploy from release with flags; gate traffic on readiness; canary with automatic comparison; change schemas by expand and contract; roll back unless data says otherwise.

## Part 4 — Infrastructure as code

### Why code

Infrastructure as code describes networks, databases, clusters and permissions in versioned files that a tool applies. Changes are reviewed in pull requests, environments can be recreated, and the files document what exists. Clicked changes leave no trace and make environments drift apart.

### Declarative, idempotent, immutable

- **Declarative**: you describe the desired end state; the tool compares it with reality and computes the steps.
- **Idempotent**: applying twice has the same effect as once, so a failed run can be retried.
- **Immutable infrastructure**: instead of patching servers, build a new image and replace them; rollback is redeploying the previous image.
- **Drift**: reality no longer matches the code, usually after a manual change. Detect it with scheduled plans and bring fixes back into code.

### The landscape

| Kind | Tools | Role |
|---|---|---|
| Provisioning, declarative | Terraform, OpenTofu | Create cloud and SaaS resources through APIs, any provider |
| Cloud-native | AWS CloudFormation, Azure Bicep, Google Cloud Infrastructure Manager | The same for one cloud (Infrastructure Manager runs Terraform) |
| General-purpose languages | Pulumi, AWS CDK | Infrastructure written in TypeScript, Python, Go |
| Kubernetes control plane | Crossplane | Cloud resources as Kubernetes objects, reconciled continuously |
| Configuration management | Ansible, Chef, Puppet | Configure software inside existing machines |

### Policy as code and review

Rules such as no public buckets or required labels can be checked automatically against every plan (OPA and Conftest with Rego, Sentinel in HCP Terraform), failing the pipeline before apply. Reviewers then focus on intent. Post the plan on the pull request: the diff shows the intent, the plan shows the effect, such as a database that would be replaced.

### Organising code and state

Keep shared modules and one small root configuration per environment, each with its own variables and its own state. Split states by lifecycle and ownership (network, shared data, each service): smaller states plan faster, take tighter permissions and limit the blast radius of a mistake. Terragrunt can remove the repetition this creates.

**What to remember.** Describe the end state, keep it in Git, review plans not just diffs, detect drift, enforce guardrails as policy, and split state to limit what a mistake can reach.

## Part 5 — Terraform and OpenTofu

### Licences and forks

HashiCorp moved Terraform to the Business Source License in 2023; **OpenTofu**, under the Linux Foundation, is the open-source fork from the last open release, largely compatible and adding features such as client-side state encryption. HashiCorp is now part of IBM. What follows applies to both.

### The language

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
  backend "gcs" {
    bucket = "acme-tf-state"
    prefix = "web/production"
  }
}

variable "region" {
  type    = string
  default = "europe-west1"
}

resource "google_storage_bucket" "assets" {
  name     = "acme-assets"
  location = var.region
}

output "bucket_url" {
  value = google_storage_bucket.assets.url
}
```

- **Providers** talk to APIs and define resource types; `terraform init` downloads them and records exact versions in `.terraform.lock.hcl`, which you commit.
- **Resources** are managed objects; **data sources** only read objects managed elsewhere.
- **Variables** are inputs (from `.tfvars` files, `-var` or `TF_VAR_` environment variables); **outputs** expose results; **locals** name expressions.
- **Modules** are folders with inputs and outputs, called with a `source` and a version.

### The workflow and the state

`terraform init`, then `plan` (what would change), then `apply`. The **state** maps each resource address to the real object; keep it in a remote backend with **locking** (GCS, HCP Terraform, S3 with `use_lockfile`), never in Git, since it can contain secrets.

Read plans carefully: `+` create, `-` destroy, `~` update in place, `-/+` replace. A replacement of a stateful resource means data loss unless planned.

### count or for_each

With `count`, instances are numbered: removing an item in the middle shifts the rest and recreates them. With `for_each`, instances are keyed by name: removing one touches only that one. Use `for_each` for collections, `count` for identical copies or an on/off switch.

### Changing what exists

| Need | Block |
|---|---|
| Bring an existing object under management | `import` (with `-generate-config-out` to draft the code) |
| Rename or move a resource without recreating it | `moved` |
| Stop managing an object without destroying it | `removed` with `lifecycle { destroy = false }` |
| Refuse any plan that would destroy it | `lifecycle { prevent_destroy = true }` |
| Create the replacement before destroying the old | `lifecycle { create_before_destroy = true }` |
| Stop reverting an attribute changed elsewhere | `lifecycle { ignore_changes = [...] }` |

### Secrets and tests

`sensitive = true` hides a value in output but not in state. Since 1.10 and 1.11, **ephemeral values** and **write-only arguments** let a secret pass to a resource without being stored in plan or state. `terraform test` runs `.tftest.hcl` files that plan or apply a module and check assertions; `check` blocks verify live conditions after apply.

**What to remember.** Pin providers and commit the lock file; remote state with locking; read every replacement in the plan; `for_each` for collections; `import`, `moved` and `removed` instead of editing state by hand; keep secrets out of state.

## Part 6 — Kubernetes

### The core objects

| Object | Role |
|---|---|
| Pod | One or more containers sharing a network address; disposable |
| Deployment | Keeps N identical Pods running, rolls out new versions |
| Service | A stable name and address in front of matching Pods |
| Ingress, Gateway API | HTTP routing from outside by host and path |
| ConfigMap, Secret | Configuration and credentials given to Pods |
| HorizontalPodAutoscaler | Changes the replica count to keep a metric near a target |

Kubernetes is declarative: `kubectl apply -f` stores the desired state, and controllers continuously make reality match.

### A Deployment worth running

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: europe-docker.pkg.dev/acme/apps/web@sha256:9f2c0d
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits: { memory: 512Mi }
          readinessProbe:
            httpGet: { path: /ready, port: 8080 }
          livenessProbe:
            httpGet: { path: /health, port: 8080 }
```

- **Requests** are what the scheduler reserves; **limits** cap use (above the memory limit, the container is killed).
- `maxSurge: 1` and `maxUnavailable: 0` add one new Pod at a time and never drop below the desired count.
- Probes gate traffic and restart stuck containers.

### Packaging and configuration

- **Helm** renders templates with values into charts, with release history: good for distributing software.
- **Kustomize** (built into `kubectl apply -k`) patches plain YAML with per-environment overlays.
- **Secrets** are only base64 by default: protect them with RBAC and encryption at rest, or sync them from a secret manager.

### Availability and identity

- A **PodDisruptionBudget** limits how many Pods voluntary disruptions (node upgrades) may take down at once.
- **Taints and tolerations** reserve nodes; **affinity** spreads replicas across zones.
- On GKE, **Workload Identity** gives each Kubernetes service account its own IAM permissions, with no key files.
- **QoS classes** follow from requests and limits: Guaranteed Pods are evicted last under memory pressure.

### Operators and shutdown

An **operator** is a controller with custom resources that encodes how to run one application (backups, failover, upgrades). On shutdown, a Pod receives SIGTERM and has `terminationGracePeriodSeconds` (30 by default) to finish in-flight requests before SIGKILL; a short `preStop` pause covers the moment endpoints are still updating.

**What to remember.** Deployments for Pods, Services for addresses, probes for traffic, requests for scheduling; package with Helm or Kustomize; keep secrets out of plain manifests; handle SIGTERM.

## Part 7 — GitOps and managed platforms

### GitOps

GitOps keeps the desired state of systems in Git and lets an agent (Argo CD, Flux) continuously apply it. Changes to production become pull requests: reviewed, recorded, revertible. The agent also reverts manual changes (drift) when self-heal is on.

| | Push-based | Pull-based |
|---|---|---|
| Who applies | CI, holding cluster credentials | An agent inside the cluster |
| Drift | Not seen until the next deploy | Detected and corrected continuously |
| Fits | Platforms without an agent, such as Cloud Run | Kubernetes clusters |

Environments are folders or overlays in a configuration repository; **promotion** is a pull request bumping the image digest in the next environment. Tools (Flux image automation, Argo CD Image Updater) can open those pull requests. **Secrets** are committed only encrypted (SOPS, Sealed Secrets) or as references resolved from a secret manager (External Secrets). Argo CD **sync waves** and hooks order resources, for example a migration job before the Deployment.

A cluster lost entirely is rebuilt from code: Terraform for the cluster, then the agent syncs everything else. Only data needs backups, and the whole procedure needs rehearsing.

### Managed platforms

Platforms such as Cloud Run, App Runner, Azure Container Apps or Fly.io run your container and scale it, even to zero; you give up node access and accept request limits in exchange for much less operational work.

On **Cloud Run**:

- Each deploy creates an immutable **revision**; traffic can be split between revisions, sent back to an older one, or kept at zero for a tagged candidate with its own URL.
- **Concurrency** is the number of simultaneous requests per instance; **max instances** caps scaling, and requests above capacity queue briefly, then get a 429.
- **Minimum instances** remove cold starts. Set them on the service (`--min`), not on each revision (`--min-instances`), or every tagged candidate keeps a warm, billed instance.
- **Cloud Deploy** adds managed promotion through ordered targets with approvals and canary steps.

Luma's release workflow is a compact example: build the image, run migrations as a Cloud Run job, deploy a `--no-traffic` revision tagged `candidate`, check it, then move traffic.

**What to remember.** Git as the source of truth, an agent that reconciles, promotion by pull request, encrypted or referenced secrets; on Cloud Run, revisions and tags give canaries and instant rollbacks.

## Part 8 — Operations

### Observability

- **Metrics** show that something is wrong: request rate, error rate, latency percentiles, saturation.
- **Logs** explain what happened in one place; containers write them to standard output, as structured JSON.
- **Traces** follow one request across services.

OpenTelemetry standardizes collecting all three. Health endpoints let platforms route around and restart unhealthy instances.

### SLIs, SLOs and error budgets

An **SLI** is what you measure (share of requests served successfully within 300 ms), an **SLO** the target (99.9 percent over 30 days), an **SLA** a contract with consequences. An SLO of 99.9 percent over 30 days leaves an **error budget** of 43.2 minutes; 99.99 percent leaves about 4.3. When the budget is spent, an agreed policy slows risky releases until it recovers.

Alert on symptoms users feel, not on every cause. **Burn-rate alerts** page when the budget is being spent fast enough to run out (for example 14.4 times the sustainable rate for an hour spends 2 percent of a 30-day budget), with a short window to stop paging after recovery.

### Delivery performance

The four **DORA** metrics measure delivery: deployment frequency and lead time for changes (throughput), change failure rate and time to restore service (stability). The research behind them finds that good teams improve both together, which small, frequent changes make possible.

### Incidents

- Mitigate first (roll back, fail over), find the root cause later.
- Roles: an incident commander coordinates, an operations lead debugs, a communications lead informs users.
- **Runbooks** linked from alerts give the steps for known situations.
- **Blameless postmortems** ask how the system allowed a reasonable action to cause harm, and track the follow-up actions to completion.

### Secrets, toil and resilience

- Services read secrets from a secret manager through their own identity; nothing secret lives in images or Git.
- **Toil** is manual, repetitive, automatable work that grows with the service; cap it and engineer it away.
- **Chaos engineering** injects controlled failures to check that systems and people cope.
- **RPO** (data you can lose) and **RTO** (time to recover) are only real if restores are rehearsed.

**What to remember.** Measure what users feel, set SLOs and spend the error budget deliberately, alert on burn rate, track DORA, run blameless incidents, and rehearse recovery.

## Exercises

1. Your pipeline rebuilds the image for production after staging passes. What is wrong, and what should it do instead?
2. Rewrite a single-stage Node `Dockerfile` that runs as root with `CMD npm start` into a better one. List three changes.
3. A canary at 10 percent shows 4 percent errors against 0.5 percent on the old version. What happens next, ideally without a person?
4. A column `email` must move to a new table `contacts`. Outline the expand/contract steps.
5. A teammate renames a resource in Terraform and the plan shows `-/+` on a database. What do you do?
6. Three buckets are created with `count` from a list. Someone removes the first name. What does the plan show, and how do you avoid it?
7. Write the minimal fields of a Deployment that keeps three replicas, never drops below three during rollout, and gates traffic on `/ready`.
8. Your service has an SLO of 99.9 percent over 30 days and has already been down 35 minutes this month. How much budget is left, and what does the policy suggest?

### Answers

1. It ships an artifact nobody tested. Build once, push it with a version and digest, deploy that digest to staging, then promote the same digest to production; only configuration differs.
2. A multi-stage build, dependency manifests copied before the code, `USER node`, and the exec form `CMD ["node", "dist/server.js"]`; also a `.dockerignore`.
3. Traffic goes back to the old version and the release stops; automated canary analysis compares canary and baseline and rolls back on its own.
4. Create `contacts`; write to both places and backfill; read from `contacts`; stop writing `email`; drop the column in a later release.
5. Stop: add a `moved` block from the old address to the new one, plan again and expect no change; if the replacement comes from an immutable argument, rethink the change.
6. The two remaining buckets shift indexes and are planned for destruction and recreation. Use `for_each` over a set of names, with `moved` blocks to migrate the existing instances.
7. See the Deployment in Part 6: `replicas: 3`, `maxSurge: 1`, `maxUnavailable: 0`, a `readinessProbe` on `/ready`.
8. 43.2 minus 35 leaves about 8 minutes; the policy suggests freezing risky releases and working on reliability until the budget recovers.

## Sources

Reference pages for each part. Tools and limits change: check the page before relying on a detail.

| Part | Pages |
|---|---|
| 1 | [The Twelve-Factor App](https://12factor.net/) · [SLSA](https://slsa.dev/) |
| 2 | [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) · [OCI image specification](https://github.com/opencontainers/image-spec) |
| 3 | [Argo Rollouts](https://argoproj.github.io/rollouts/) · [Cloud Run rollouts and traffic migration](https://cloud.google.com/run/docs/rollouts-rollbacks-traffic-migration) |
| 4 | [Open Policy Agent](https://www.openpolicyagent.org/) · [Crossplane](https://www.crossplane.io/) |
| 5 | [Terraform language](https://developer.hashicorp.com/terraform/language) · [OpenTofu](https://opentofu.org/) |
| 6 | [Kubernetes documentation](https://kubernetes.io/docs/home/) · [Gateway API](https://gateway-api.sigs.k8s.io/) |
| 7 | [OpenGitOps principles](https://opengitops.dev/) · [Argo CD](https://argo-cd.readthedocs.io/) · [Cloud Run documentation](https://cloud.google.com/run/docs) |
| 8 | [Google SRE books](https://sre.google/books/) · [DORA](https://dora.dev/) · [OpenTelemetry](https://opentelemetry.io/) |
