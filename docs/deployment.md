# Deployment

The app is one Node process that serves the built pages and the API on a
single port, with either a local SQLite file or a PostgreSQL database. It runs
on any machine with Node (a home server behind a Cloudflare Tunnel, say), or
as a container on Google Cloud Run with releases from GitHub Actions.

- [Requirements](#requirements)
- [Production build](#production-build)
- [Running as a service](#running-as-a-service)
- [HTTPS and sign-in](#https-and-sign-in)
- [Behind a reverse proxy](#behind-a-reverse-proxy)
- [Cloudflare Tunnel](#cloudflare-tunnel)
- [Cloud Run](#cloud-run)
- [Releases](#releases)
- [Security](#security)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)

## Requirements

- **Node.js 20.12 or later**, needed for `process.loadEnvFile`; developed on Node 22.
- **`better-sqlite3`** is a native module, and an optional dependency. `npm install` downloads a prebuilt binary for common platforms (x64 and arm64 on Linux and macOS, x64 on Windows). Elsewhere, including some 32-bit ARM boards, it compiles from source and needs `python3`, `make` and a C++ compiler; if that fails, npm goes on without it, and only SQLite is unavailable. With `DATABASE_URL` set, it is never loaded. The production image leaves it out.
- **Disk:** the SQLite file grows by about 75 bytes per answer, indexes included, so 100,000 answers take under 10 MB.

## Production build

```sh
npm ci
cp .env.example .env      # then edit it
npm run build             # type checks, then builds the pages into dist/
npm start                 # serves dist/ and /api on $PORT (default 8787)
```

`npm start` runs the TypeScript server directly with `tsx`. The container
runs a bundle instead (`npm run build:server` → `dist-server/`), which starts
faster. At startup the server:

1. Applies migrations, rebuilds missing test answers, imports new vocabulary books (`VOCAB_FILE`) and, on a server without one, the question bank (`QUIZ_BANK_FILE`), and purges expired sessions: the **maintenance**, also available alone as `npm run maintenance`.
2. Purges expired sessions again every hour.
3. Logs the database used, the ways to sign in and the port.

On Cloud Run, steps 1 and 2 are left to the release job (see [Cloud Run](#cloud-run)).

```
database: SQLite (/srv/calcul-colonnes/data/calcul-colonnes.sqlite)
sign-in: email and password, Google, GitHub · https://calcul.example.ch · registration closed
listening on http://localhost:8787
```

Without `dist/` it serves the API only and says so.

## Running as a service

Example systemd unit, `/etc/systemd/system/calcul-colonnes.service`:

```ini
[Unit]
Description=Calcul en colonnes
After=network-online.target

[Service]
User=calcul
WorkingDirectory=/srv/calcul-colonnes
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl enable --now calcul-colonnes
journalctl -u calcul-colonnes -f
```

The `.env` file is read from the working directory. The server stops cleanly
on `SIGTERM`, closing the database.

## HTTPS and sign-in

On anything but `localhost`, serve the app over **HTTPS**: passwords and the
session cookie must not travel in clear, and providers refuse `http://`
redirect URIs other than `localhost`.

Set in `.env`:

| Variable | Default | |
|---|---|---|
| `PUBLIC_URL` | `http://localhost:$PORT` | The address people type, e.g. `https://calcul.example.ch`. With `https://`, cookies become `Secure` with the `__Host-` prefix. |
| `COOKIE_SECURE` | from `PUBLIC_URL` | Force `true` or `false` |
| `SESSION_DAYS` | `30` | Session lifetime after last use |
| `REGISTRATION` | `open` | `closed`: only the first account can be created |
| `TRUST_PROXY` | `false` | `true` behind a reverse proxy or Cloudflare, for rate limiting by client address (`CF-Connecting-IP`, else the last `X-Forwarded-For` entry) |
| `HOST` | *(all interfaces)* | `127.0.0.1` when only a local proxy or tunnel should connect |
| `AUTH_ATTEMPTS_PER_ADDRESS` | `100` | Sign-in attempts per address in 15 minutes |
| `GOOGLE_*`, `MICROSOFT_*`, `GITHUB_*`, `OIDC_*` | *(empty)* | Providers, see [Authentication › Providers](authentication.md#providers-1) |

For a family server: create your account, then set `REGISTRATION=closed` and
restart. Give the children a username from the Account page.

## Behind a reverse proxy

The app uses relative paths (`/api/…`), so it expects to be served at the root
of a host name, not under a sub-path. Caddy obtains and renews the HTTPS
certificate by itself:

```caddy
calcul.example.ch {
    reverse_proxy localhost:8787
}
```

With nginx, pass the host and the client address:

```nginx
location / {
    proxy_pass http://127.0.0.1:8787;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then `PUBLIC_URL=https://calcul.example.ch` and `TRUST_PROXY=true`. Keep the
Node port closed to the outside: only the proxy should reach it, otherwise a
client could send its own `X-Forwarded-For`.

## Cloudflare Tunnel

A tunnel publishes the app on an HTTPS address of your Cloudflare domain
without opening a port on your router: `cloudflared` connects out to
Cloudflare and forwards requests to `localhost:8787`. Cloudflare provides the
certificate.

**1. The app,** in `.env`:

```ini
PUBLIC_URL=https://calcul.example.ch
HOST=127.0.0.1
TRUST_PROXY=true
REGISTRATION=closed        # after creating your account
```

- **`HOST=127.0.0.1`:** only `cloudflared`, on the same machine, can reach the server.
- **`TRUST_PROXY=true`:** rate limits use the visitor's address from `CF-Connecting-IP`.

Then `npm run build && npm start`, or the systemd unit above.

**2. The tunnel,** with the `cloudflared` command line:

```sh
cloudflared tunnel login                      # once: choose the domain
cloudflared tunnel create calcul              # prints the tunnel id, writes its credentials
cloudflared tunnel route dns calcul calcul.example.ch
```

`~/.cloudflared/config.yml`:

```yaml
tunnel: calcul
credentials-file: /home/<you>/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: calcul.example.ch
    service: http://127.0.0.1:8787
  - service: http_status:404
```

```sh
cloudflared tunnel run calcul                 # try it
sudo cloudflared service install              # then as a service (copies the config to /etc/cloudflared)
```

The tunnel can also be created from the dashboard (*Zero Trust* › *Networks* ›
*Tunnels*), with a public hostname pointing to `http://127.0.0.1:8787`.

**3. Check:** open `https://calcul.example.ch`, sign in, reload: you stay
signed in. The server log shows `sign-in: … · https://calcul.example.ch`.

**Notes**

- **Providers:** register `https://calcul.example.ch/api/auth/oauth/<id>/callback`.
- **Cloudflare settings:** keep *Rocket Loader* off for this host name, since it rewrites scripts. Default caching does not cache `/api` responses, and the built files have content hashes in their names.
- **Cloudflare Access** (optional) adds Cloudflare's own sign-in in front of the app, for example limited to your family's emails. The app's sign-in still applies behind it.
- **Locally:** with `HOST=127.0.0.1`, other devices on your network cannot use `http://<machine>:8787`; they go through the public address. Leave `HOST` empty to allow both, but local access then uses plain `http` while cookies are `Secure`, so it will not keep sessions.

## Cloud Run

Google Cloud Run runs the same server as a container, scaled to zero when
nobody uses it. At a family's or a class's traffic it stays within the free
tier. The database is Neon, as with a home server: a container's disk is
wiped at every restart, so SQLite is refused there.

```
learn.libravise.com ──▶ Cloud Run service "luma" (europe-west1, 1 instance at most)
                              │ DATABASE_URL from Secret Manager
                              ▼
                        Neon (Frankfurt) ◀── Cloud Run job "luma-maintenance" (once per release)
```

### What changes on Cloud Run

The server notices Cloud Run by itself (`K_SERVICE` in a service,
`CLOUD_RUN_JOB` in a job). There:

| | Home server | Cloud Run |
|---|---|---|
| Maintenance (migrations, backfills, purge) | At every start | Once per release, as the job `luma-maintenance` (`node dist-server/index.js maintenance`) |
| Hourly session purge | Timer | None: the CPU sleeps between requests; the release job purges, and expired sessions are refused when read anyway |
| Without `DATABASE_URL` | SQLite | Refuses to start |
| Logs | Plain lines | One JSON object per line (`severity`, `message`), read by Cloud Logging |
| Configuration | `.env` | Environment variables; `DATABASE_URL` and provider secrets from Secret Manager |

Overrides: `STARTUP_MAINTENANCE=true|false` and `LOG_FORMAT=json|text`.

### One-time setup

About an hour. Needs a Google Cloud project with billing, `gcloud` signed in,
the Neon **pooled** connection string of production, and the GitHub repository.

```sh
PROJECT=luma-prod GITHUB_REPO=<owner>/calcul-colonnes deploy/setup-gcp.sh
```

The script ([deploy/setup-gcp.sh](../deploy/setup-gcp.sh)) can be run again
safely. It:

1. Enables the APIs.
2. Creates the image repository with a cleanup policy ([deploy/cleanup-policy.json](../deploy/cleanup-policy.json): the ten latest images, nothing older than 30 days beyond those).
3. Creates two service accounts:
   - `luma-runtime`, the app, which may read its secrets and nothing else;
   - `luma-deployer`, for GitHub Actions: deploy Cloud Run, push images, act as `luma-runtime`.
4. Stores the secrets in Secret Manager. They are typed, never passed as arguments. Provider secrets are asked for when their client id is set in the environment (`GOOGLE_CLIENT_ID=… deploy/setup-gcp.sh`).
5. Lets GitHub Actions of this repository only act as `luma-deployer`, through Workload Identity Federation: no key file exists anywhere.
6. Creates the service `luma` (public, one instance at most, startup CPU boost, 512 MiB) and the job `luma-maintenance`, both on Google's placeholder image until the first release.

It ends by printing the GitHub variables to set (*Settings › Secrets and
variables › Actions*): `GCP_PROJECT`, `GCP_REGION`, `GCP_WIF_PROVIDER`,
`GCP_DEPLOYER`, `NEON_PROJECT_ID`, and the secret `NEON_API_KEY`.

Then release (next section): `npm version minor && git push --follow-tags`.

### Custom domain

Domain mapping is offered in some regions only: europe-west1 (Belgium) has it,
europe-southwest1 (Madrid) and europe-west3 (Frankfurt) do not. Neon in
Frankfurt is a few milliseconds from Belgium.

1. Verify the domain once with Google: `gcloud domains verify libravise.com`.
2. Map it: `gcloud beta run domain-mappings create --service=luma --domain=learn.libravise.com --region=europe-west1`.
3. At Cloudflare, replace the tunnel's record for `learn` with a **CNAME to `ghs.googlehosted.com`**, set to **DNS only** (grey cloud): Google issues the certificate, which takes a few minutes to an hour.
4. Set the public address: `gcloud run services update luma --region=europe-west1 --update-env-vars=PUBLIC_URL=https://learn.libravise.com`.
5. Register `https://learn.libravise.com/api/auth/oauth/<id>/callback` with each provider (already done if the tunnel used the same address).

Sessions and data carry over: same database, same cookie name, same address.
To go back to the home server, point the record at the tunnel again.

### Checks after the first release

- **Visitor address.** Rate limits read the last `X-Forwarded-For` entry (`TRUST_PROXY=true`, set by the setup script). To confirm that Cloud Run puts the visitor's address there: set `AUTH_ATTEMPTS_PER_ADDRESS=3` on the service, make four sign-in attempts from a phone on mobile data, and check that the phone is refused while your computer is not. Then remove the variable.
- **Cold start.** After 20 minutes without use, time the first page load. A few seconds is expected (container start, then Neon waking up). To remove it, keep one instance warm (below).

### One warm instance

Before opening the app to friends and family, keep one instance running, so
nobody waits for a cold start:

```sh
gcloud run services update luma --region=europe-west1 --min 1
# or: MIN_INSTANCES=1 PROJECT=… GITHUB_REPO=… deploy/setup-gcp.sh
```

- **Service-level** (`--min`), not per revision (`--min-instances`): a release's candidate revision, tagged without traffic, would otherwise get a warm instance of its own. Releases keep the setting.
- **Cost:** an idle instance is billed at the lower idle rate; with 512 MiB and request-based billing, about $10 a month. `--min 0` (or `default`) stops it.
- **Still one instance at most** (`--max-instances=1`): the rate limits are kept in memory. Enough for a few families.
- **Neon:** a warm instance does not keep the database awake; on a paid plan, raise or turn off *suspend after inactivity* on the compute so the first query is quick too.

### Alerts

- **Budget:** *Billing › Budgets & alerts*: a monthly budget (say $20) with e-mails at 50 %, 90 % and 100 %.
- **Errors:** *Logging › Logs-based metrics*: a counter on `resource.type="cloud_run_revision" AND resource.labels.service_name="luma" AND severity>=ERROR`, then *Monitoring › Alerting*: more than 5 in 10 minutes, by e-mail.
- **Uptime:** *Monitoring › Uptime checks* on `https://<your domain>/api/health`, every 5 minutes.

### Staging

A Neon branch of production is a free copy to try a release on, with real
data, before `main`:

```sh
neonctl branches create --name staging --parent main --project-id <project id>
neonctl connection-string staging --project-id <project id>
```

Run the new version locally (or as a second Cloud Run service, `luma-staging`,
with `DATABASE_URL` from that branch) and click through; reset the branch to
production with `neonctl branches reset staging --parent` before the next try.

### Day to day

```sh
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="luma"' \
  --limit=50 --format='value(timestamp, severity, jsonPayload.message, textPayload)'   # recent logs
gcloud run revisions list --service=luma --region=europe-west1           # what was deployed
gcloud run services update-traffic luma --region=europe-west1 \
  --to-revisions=<revision>=100                                          # roll back in seconds
gcloud run services update-traffic luma --region=europe-west1 --to-latest   # follow the newest again
```

After a release, traffic follows the newest revision, so a change made with
`gcloud run services update` (a variable, a secret) is served at once. After a
rollback or a held release, traffic is pinned to one revision: such a change
then creates a revision that gets no traffic until `--to-latest` or the next
release.

### Running the image locally

```sh
docker build --build-arg BUILD_ID=local -t luma .
docker run --rm -e DATABASE_URL=postgresql://… luma node dist-server/index.js maintenance
docker run --rm -p 8080:8080 -e K_SERVICE=local -e DATABASE_URL=postgresql://… \
  -e PUBLIC_URL=http://localhost:8080 -e COOKIE_SECURE=false luma
```

## Releases

Two GitHub Actions workflows, for one developer working on `main`:

| Workflow | When | What |
|---|---|---|
| [checks.yml](../.github/workflows/checks.yml) | Every push to `main` | Type checks and build, `check:quiz`, `check:vocab`, `check:family`, `check:discover`, `check:physics`, `check:astronomy`, `check:biology`, `check:tour`, the e2e suite on SQLite and again on PostgreSQL, the image build. Nothing is deployed. |
| [release.yml](../.github/workflows/release.yml) | A tag `v*`, or *Run workflow* | The same checks, unless the commit already passed them on `main`; then the steps below |

A release:

```sh
# CHANGELOG.md updated, then:
npm version minor            # 6.1.0 → 6.2.0: commits and tags v6.2.0
git push --follow-tags       # the tag starts the release
```

0. **Checks, once per commit.** `npm version` and `git push --follow-tags` push the
   commit and its tag together, so *Checks* (for `main`) and *Release* (for the
   tag) start at the same time. The release first waits for the *Checks* run on
   the same commit (up to two minutes for it to appear, then until it ends). If
   it passed, the checks are not run again; if it failed or there is none (a tag
   on a commit never pushed to `main`, a run deleted), the release runs them
   itself. Either way nothing is deployed from a commit that has not passed them.
1. **Build the image once,** with the tag as build id, start it against a throwaway PostgreSQL, and check `/api/health`, `/version.json` and the page.
2. **Push it** to Artifact Registry.
3. **Rehearse the migrations** on a Neon branch of production created for the run, set to expire after two hours, and deleted at the end. A migration that fails on real rows fails here, before production is touched. A branch left by a cancelled run disappears by itself.
4. **Migrate production** with the job `luma-maintenance` on the new image.
5. **Deploy a candidate:** a new revision with no traffic, at its own address (`https://candidate---luma-….run.app`).
6. **Smoke test the candidate:** `/api/health`, `/version.json` naming this release, the page.
7. **Move all traffic to it.**

Any failure stops the release with the current revision still serving.

**Trying a release first.** *Actions › Release › Run workflow* with **hold**:
it stops after the smoke test. Open the candidate address on a phone (it uses
the production database, so what you do there is real), then run the workflow
again with **promote** to move the traffic. Sign in with email and password
there: Google, Microsoft and GitHub send you back to `PUBLIC_URL`, not to the
candidate.

**Migrations without downtime.** A release migrates while the previous
revision still serves. So a migration must work with both: add tables and
columns; rename or drop only in a later release, once no running code uses the
old name.

**Rolling back.** Every release stays as a revision:
`gcloud run services update-traffic luma --region=europe-west1 --to-revisions=<previous>=100`.
Migrations are not undone, which is why they only add. Images are kept for
the ten latest releases and at least 30 days ([cleanup policy](../deploy/cleanup-policy.json)):
an older revision may no longer start.

**Dependencies.** [Dependabot](../.github/dependabot.yml) opens a weekly pull
request for the pinned actions and for npm packages; `checks.yml` does not run
on pull requests, so merge them to `main` and watch the checks there.

## Security

- **Sign-in required** for everything except the sign-in screen and `/api/health`. Each account sees only its own players; a player's own session sees only that player. Details: [Authentication](authentication.md).
- **Passwords** are hashed with scrypt; sessions are random tokens stored only as SHA-256; cookies are `HttpOnly` and `SameSite=Lax`, and `Secure` with HTTPS.
- **Cross-site requests** that change data are refused, and sign-in attempts are rate limited. Rate limits are kept in memory, so run a single server process (on Cloud Run: `--max-instances=1`, as the setup script sets).
- **Open registration:** with `REGISTRATION=open`, anyone who reaches the server can create an account. Their account is empty and sees nothing of others, but close registration if the server is public and meant for one family or class.
- **Grading cannot be forged from the browser:** the server recomputes every mark. A signed-in user can still post fabricated answers for their own players through the API.
- **Personal data:** the database holds first names and learning results of children. Keep backups as private as the database. Deleting a player from the Scores screen removes all their rows.
- **No external requests:** the app loads no third-party scripts, fonts or analytics; KaTeX is bundled.
- **The browser** keeps only settings and the last player's id in `localStorage`.

## Updating

On Cloud Run, push a version tag: see [Releases](#releases). On a home server:

```sh
git pull                  # or unpack the new release
npm ci
npm run build
sudo systemctl restart calcul-colonnes
```

Migrations run by themselves at the next start. Then:

- **Before upgrading:** back up the database ([Database › Backups](database.md#backups)).
- **From 3.x to 4.x:** sign-in becomes required. Open the app right after the upgrade and create your account: the first account receives all existing players. See [Authentication › Upgrading](authentication.md#upgrading-from-3x).
- **After upgrading:** open pages and installed apps update by themselves, from 5.3 on: each build publishes `/version.json`, and a window learns of the new build when it comes to the front (or within 15 minutes). A page still on 5.2 or older needs one manual reload (Ctrl+R / Cmd+R, or close and reopen the installed app).

### Undoing a bad import

A vocabulary import that removes entries also removes the players' progress
on them. Since 6.4.1 such an import is refused unless `--replace` is given.
If one went through all the same, Neon can put the database back as it was a
moment before, from its history. How far back depends on the plan; see Neon's
*History window* page.

1. **Check what happened:** `SELECT slug, term_lang, title FROM vocab_books;`. A book in the wrong language (`collins-spanish` with `term_lang` `de`) confirms an overwrite.
2. **Find a time before the import,** in UTC (Madrid in summer is UTC+2).
3. **Restore the production branch to it.** In the Neon console: *Branches › main › Restore*, or:

   ```sh
   neonctl branches restore main ^self@2026-10-21T18:00:00Z \
     --preserve-under-name main_before_restore --project-id <project id>
   ```

   Connections drop for a few seconds; the app reconnects by itself. Everything written after that time is undone too: answers given since, any other import. The state before the restore is kept as the branch `main_before_restore`, to look at or go back to. Delete it once you are satisfied, as it counts towards the branch limit.
4. **Import the right file:** for example `npm run vocab:import -- data/vocab-german.json`, with the German file extracted again by 6.4.1 (`collins-german`).

### Caching

The server sets `Cache-Control` itself, so nothing is needed at Cloudflare or
a proxy:

| Path | `Cache-Control` | Why |
|---|---|---|
| `/`, `*.html`, `/version.json`, `/manifest.webmanifest` | `no-cache` | Checked at every load: a reload always gets the current build |
| `/assets/*` | `public, max-age=31536000, immutable` | Their names contain a hash of their content: a new build has new names |
| Other files (icons) | `public, max-age=86400` | |
| `/api/*` | `no-store` | Per account, changes with every answer |

Before 5.3, `index.html` had no `Cache-Control`: browsers could keep it for
hours from its date alone, which is why an installed desktop app showed an old
version. Cloudflare's own rules (*Cache Rules*, *Cache Everything*) override
these headers: if you added one for the site, exclude `/`, `/version.json`
and `/api/`.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| The app shows **Serveur injoignable** | The server is not running or not reachable from this device. Check `npm start`, the port and the firewall. |
| *Résultat non enregistré* after a test | Server unreachable, or the page runs an older build than the server. Reload the page. |
| `DATABASE_URL must start with postgresql://` | Malformed `DATABASE_URL`; empty it to use SQLite. |
| Signed out after every reload | `PUBLIC_URL` is `https://` but the page was opened over `http://` (a local IP, say): browsers drop `Secure` cookies there. Open the HTTPS address. |
| Sign-in refused with `cross_site` | `PUBLIC_URL` differs from the address in the browser (another host name, `www.`, a port). |
| A provider says *redirect_uri mismatch* | The URI registered with the provider must be exactly `<PUBLIC_URL>/api/auth/oauth/<id>/callback`. |
| *Trop de tentatives* for everyone | Behind a proxy without `TRUST_PROXY=true`, all visitors share one address. |
| `SQLite is not available` | `better-sqlite3` could not be installed (no prebuilt binary for this platform): install `python3`, `make` and `g++` and run `npm install` again, or set `DATABASE_URL`. |
| `DATABASE_URL is required on Cloud Run` | The service or job lacks the secret: `gcloud run services update luma --update-secrets=DATABASE_URL=database-url:latest`. |
| A release stops at *Rehearse the migrations* | A migration fails on production's data. Production is untouched: fix the migration, tag again. |
| A release stops at *Smoke test the candidate* | The new revision does not answer correctly; users still have the previous one. The logs (*Day to day* above) show why. |
| `EADDRINUSE` | Another process uses the port; change `PORT` or stop it. |
| First request slow on Neon | The Neon compute was suspended and is waking up; subsequent requests are fast. |
| `quiz N: answers not rebuilt` in the log | An old test could not be regenerated (e.g. edited by hand in the database). It keeps its mark, but is absent from the progress page. |
