# Hosting — Raspberry Pi + Cloudflare Tunnel

The apps are static builds served from nginx on the Pi, exposed publicly through a
Cloudflare Tunnel. No port-forwarding, so it works behind the home double-NAT and
survives a dynamic home IP.

```
push to master ─▶ self-hosted GitHub runner ON the Pi  (outbound only)
                  bun install && bun run build
                          │ rsync dist/ ─▶ /var/www/<host>
                          ▼
   nginx 127.0.0.1:8080 ── larshansen.dev · cv.* · maze.*
                          ▲
   cloudflared tunnel ────┘  (outbound to Cloudflare)
                          ▲
   Cloudflare edge (TLS) ─┘  (larshansen.dev zone moved here)
```

| Host | App |
|------|-----|
| `larshansen.dev` | `apps/landing` (the platform game) |
| `cv.larshansen.dev` | `apps/portfolio` |
| `maze.larshansen.dev` | `apps/iron-maze` |

## One-time setup

### 1. Move the domain to Cloudflare
`larshansen.dev` currently uses Namecheap DNS (`registrar-servers.com`) and its A
record points at the home IP.

1. Cloudflare dashboard → **Add a site** → `larshansen.dev` (Free plan). Cloudflare
   imports existing records — you can delete the old A record; the tunnel adds its own.
2. Copy the two Cloudflare nameservers it shows.
3. Namecheap → Domain → **Nameservers → Custom DNS** → paste the two CF nameservers.
   Propagation is usually minutes to a couple of hours.

### 2. Pi: nginx + webroots
```bash
sudo apt update && sudo apt install -y nginx rsync
# webroots, owned by the runner user (no sudo needed at deploy time)
sudo mkdir -p /var/www/{larshansen.dev,cv.larshansen.dev,maze.larshansen.dev}
sudo chown -R "$USER":"$USER" /var/www/larshansen.dev /var/www/cv.larshansen.dev /var/www/maze.larshansen.dev
# nginx site (file is in this repo)
sudo cp infra/nginx/larshansen.conf /etc/nginx/sites-available/larshansen.conf
sudo ln -sf /etc/nginx/sites-available/larshansen.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Pi: Cloudflare Tunnel
```bash
# install cloudflared (arm64)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
  -o /usr/local/bin/cloudflared && sudo chmod +x /usr/local/bin/cloudflared

cloudflared tunnel login                 # opens a browser; pick the larshansen.dev zone
cloudflared tunnel create larshansen     # note the TUNNEL_ID it prints

# config: copy the example and fill in TUNNEL_ID
sudo mkdir -p /etc/cloudflared
sudo cp infra/cloudflared/config.example.yml /etc/cloudflared/config.yml
sudo sed -i "s/TUNNEL_ID/<the-id>/g" /etc/cloudflared/config.yml

# DNS routes (creates the CNAMEs to the tunnel)
cloudflared tunnel route dns larshansen larshansen.dev
cloudflared tunnel route dns larshansen cv.larshansen.dev
cloudflared tunnel route dns larshansen maze.larshansen.dev

# run as a service
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

### 4. Pi: GitHub Actions self-hosted runner
GitHub → repo **Settings → Actions → Runners → New self-hosted runner** (Linux/ARM64).
Follow the shown commands, then when configuring add the label so the workflow targets it:
```bash
./config.sh --url https://github.com/larsekhansen/larshansen --token <token> --labels larshansen-pi
sudo ./svc.sh install && sudo ./svc.sh start
```
Make sure the runner user owns the `/var/www/*` dirs from step 2.

### 5. Deploy
Push to `master` (or run the **Deploy to Raspberry Pi** workflow manually). The runner
builds the monorepo and publishes each app to its webroot.

## Notes
- `.github/workflows/deploy.yml` triggers on `master` — update to `main` when the
  default branch is renamed.
- TLS is handled by Cloudflare; nginx stays plain HTTP on localhost.
- Old `HOSTINGER_FTP_*` repo secrets are leftovers from 2021 and can be deleted.
