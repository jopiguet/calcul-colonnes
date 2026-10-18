# Deployment

The app is one Node process that serves the built pages and the API on a
single port, with either a local SQLite file or a PostgreSQL database.

- [Requirements](#requirements)
- [Production build](#production-build)
- [Running as a service](#running-as-a-service)
- [HTTPS and sign-in](#https-and-sign-in)
- [Behind a reverse proxy](#behind-a-reverse-proxy)
- [Cloudflare Tunnel](#cloudflare-tunnel)
- [Security](#security)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)

## Requirements

- **Node.js 20.12 or later**, needed for `process.loadEnvFile`; developed on Node 22.
- **`better-sqlite3`** is a native module. `npm install` downloads a prebuilt binary for common platforms (x64 and arm64 on Linux and macOS, x64 on Windows). Elsewhere, including some 32-bit ARM boards, it compiles from source and needs `python3`, `make` and a C++ compiler. With `DATABASE_URL` set, SQLite is not opened, but the module is still installed.
- **Disk:** the SQLite file grows by about 75 bytes per answer, indexes included, so 100,000 answers take under 10 MB.

## Production build

```sh
npm ci
cp .env.example .env      # then edit it
npm run build             # type checks, then builds the pages into dist/
npm start                 # serves dist/ and /api on $PORT (default 8787)
```

`npm start` runs the TypeScript server directly with `tsx`, so there is no
separate server build. At startup it:

1. Applies migrations.
2. Rebuilds missing test answers.
3. Purges expired sessions, then again every hour.
4. Logs the database used, the ways to sign in and the port.

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

## Security

- **Sign-in required** for everything except the sign-in screen and `/api/health`. Each account sees only its own players; a player's own session sees only that player. Details: [Authentication](authentication.md).
- **Passwords** are hashed with scrypt; sessions are random tokens stored only as SHA-256; cookies are `HttpOnly` and `SameSite=Lax`, and `Secure` with HTTPS.
- **Cross-site requests** that change data are refused, and sign-in attempts are rate limited. Rate limits are kept in memory, so run a single server process.
- **Open registration:** with `REGISTRATION=open`, anyone who reaches the server can create an account. Their account is empty and sees nothing of others, but close registration if the server is public and meant for one family or class.
- **Grading cannot be forged from the browser:** the server recomputes every mark. A signed-in user can still post fabricated answers for their own players through the API.
- **Personal data:** the database holds first names and learning results of children. Keep backups as private as the database. Deleting a player from the Scores screen removes all their rows.
- **No external requests:** the app loads no third-party scripts, fonts or analytics; KaTeX is bundled.
- **The browser** keeps only settings and the last player's id in `localStorage`.

## Updating

```sh
git pull                  # or unpack the new release
npm ci
npm run build
sudo systemctl restart calcul-colonnes
```

Migrations run by themselves at the next start. Then:

- **Before upgrading:** back up the database ([Database › Backups](database.md#backups)).
- **From 3.x to 4.x:** sign-in becomes required. Open the app right after the upgrade and create your account: the first account receives all existing players. See [Authentication › Upgrading](authentication.md#upgrading-from-3x).
- **After upgrading:** reload the open pages, because a browser still running the previous build is refused when it submits a test from another generator version, and shows *Résultat non enregistré*.

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
| `npm install` fails on `better-sqlite3` | No prebuilt binary for this platform; install `python3`, `make` and `g++`, then retry. |
| `EADDRINUSE` | Another process uses the port; change `PORT` or stop it. |
| First request slow on Neon | The Neon compute was suspended and is waking up; subsequent requests are fast. |
| `quiz N: answers not rebuilt` in the log | An old test could not be regenerated (e.g. edited by hand in the database). It keeps its mark, but is absent from the progress page. |
