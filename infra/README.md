# Hosting — Raspberry Pi + Cloudflare Tunnel

**Live.** The apps are static builds served by nginx on the Pi, exposed through a
Cloudflare Tunnel — no port-forwarding, so it works behind the home double-NAT and a
dynamic home IP.

```
push to master ─▶ self-hosted GitHub runner ON the Pi  (outbound only)
                  bun install && bun run build
                          │ rsync dist/ ─▶ /var/www/<host>
                          ▼
   nginx 127.0.0.1:8090 ── larshansen.dev · cv.* · maze.*   (8090: 8080 is Pi-hole)
                          ▲
   cloudflared tunnel ────┘  (remotely-managed; outbound to Cloudflare)
                          ▲
   Cloudflare edge (TLS) ─┘  (larshansen.dev zone on Cloudflare)
```

| Host | App |
|------|-----|
| `larshansen.dev` | `apps/landing` (the platform game) |
| `cv.larshansen.dev` | `apps/portfolio` |
| `maze.larshansen.dev` | `apps/iron-maze` |

## Deploying
Just `git push` to `master`. The runner (`larshansen-pi`) builds the monorepo and
rsyncs each app to its webroot. Manual run: GitHub → Actions → **Deploy to Raspberry Pi**
→ Run workflow, or on the Pi: `cd ~/larshansen && git pull && PATH=~/.bun/bin:$PATH bun run build && rsync -a --delete apps/<app>/dist/ /var/www/<host>/`.

## How it's wired (on the Pi)
- **cloudflared** — systemd service, *remotely-managed* tunnel `larshansen` (connector
  token, no local `config.yml`). Ingress + DNS live in Cloudflare, not on the Pi.
- **nginx** — `/etc/nginx/sites-enabled/larshansen.conf`, three server blocks on
  `127.0.0.1:8090`, SPA fallback to `index.html`.
- **webroots** — `/var/www/{larshansen.dev,cv.larshansen.dev,maze.larshansen.dev}`,
  owned by `lars` so the runner rsyncs without sudo.
- **runner** — `~/actions-runner`, systemd service, label `larshansen-pi`.

## Managed in Cloudflare (not the Pi)
- **Tunnel ingress** — Zero Trust → Networks → Tunnels → `larshansen` → Public hostnames
  (each hostname → `http://localhost:8090`).
- **DNS** — three proxied `CNAME`s (`@`, `cv`, `maze`) → `<tunnel-id>.cfargotunnel.com`.
  The `MX`/`TXT` records are Namecheap email forwarding — leave them.

## Notes
- `.github/workflows/deploy.yml` triggers on `master` — switch to `main` if the default
  branch is renamed.
- TLS is terminated at Cloudflare; nginx stays plain HTTP on localhost.
- Old `HOSTINGER_FTP_*` repo secrets (2021) are dead — safe to delete.
- `infra/cloudflared/config.example.yml` is the *alternative* locally-managed setup
  (not what's running) — kept only for reference.
