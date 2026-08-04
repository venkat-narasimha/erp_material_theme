# Installation & Implementation Guide — `erp_material_theme`

This document covers installing and configuring the `material_theme` Frappe app from **Venkat's fork** (`venkat-narasimha/erp_material_theme`) on both **Frappe v15** and **v16**.

The fork adds v16 compatibility fixes on top of the original itrostack upstream (which targeted v15).

---

## Table of Contents

1. [Versions tested](#versions-tested)
2. [What the fork changes](#what-the-fork-changes)
3. [Install on Frappe v16](#install-on-frappe-v16)
4. [Install on Frappe v15](#install-on-frappe-v15)
5. [Asset sync (mandatory after install)](#asset-sync-mandatory-after-install)
6. [Common pitfalls + fixes](#common-pitfalls--fixes)
7. [Verify](#verify)
8. [Troubleshooting](#troubleshooting)
9. [Reference: project history](#reference-project-history)

---

## Versions tested

| Env | Frappe | ERPNext | Site | Date | Status |
|---|---|---|---|---|---|
| DEV (`pberpdev.duckdns.org`) | v16.13.0 | v16.11.0 | Install + browser-verified | 2026-08-03 13:50 IST | ✅ Live |
| QA (`pberpqa.duckdns.org`) | v16.17.5 | (same) | Install + browser-verified | 2026-08-03 14:58 IST | ✅ Live |
| DEV (`dev-erp.duckdns.org`) | v15.103.1 | v15.103.1 | Install + browser-verified | 2026-08-04 11:45 IST | ✅ Live |

**Conclusion:** the v16 patches in this fork are also v15-safe. The same fork works on both v15 and v16. **No separate v15 branch is needed.**

---

## What the fork changes

The fork keeps all of upstream itrostack's CSS/JS and adds three patches for v16 compatibility:

| Commit | File | Change |
|---|---|---|
| `22a2d3a` | `material_theme/patches/add_theme_setting_user.py` | Switched from `user_doctype.save()` (broken on v16) to `frappe.make_property_setter()` |
| `4da8646` | `material_theme/patches/add_theme_setting_user.py` | Used `fieldname` kwarg (not v15's `doc_name`), added `ignore_validate=True`, added `frappe.clear_cache(doctype=...)` |
| `f2a516d` | `material_theme/public/js/theme.js` | Deferred `frappe.ui.ThemeSwitcher` override to `$(document).on("app_ready", ...)` event (v16 loads `app_include_js` before Frappe bundle, so class overrides fail without deferring) |

**Why these patches?** Frappe v16 changed:
- `DocType.save()` validation tightened (rejects field-option modifications).
- `app_include_js` scripts now load in `<head>` BEFORE Frappe bundle (instead of after).
- Property setter dict key changed (`doc_name` → `fieldname`).
- `validate_fieldtype_change()` strict mode added (needs `ignore_validate=True`).
- DocType meta cached more aggressively (needs explicit `clear_cache(doctype=...)`).

For full analysis of v16 API quirks, see [`memory/research/2026-08-03-itrostack-material-theme-deep-dive.md`](../) (in OpenClaw workspace; not in this repo).

---

## Install on Frappe v16

### Pre-flight

```bash
# Confirm Frappe version (must be v15.x or v16.x)
docker exec <env>-backend-1 bash -c \
  "cd /home/frappe/frappe-bench && bench --site <site> execute 'frappe.__version__'"

# Confirm sites folder name (used in asset paths)
docker exec <env>-backend-1 ls /home/frappe/frappe-bench/sites/

# Backup (mandatory — keep last 2 backups)
docker exec -u frappe <env>-backend-1 bash -c \
  "cd /home/frappe/frappe-bench && bench --site <site> backup --with-files"
```

### Install

```bash
docker exec -it -u frappe <env>-backend-1 bash
cd /home/frappe/frappe-bench

# If 503 from GitHub (transient): rm -rf apps/erp_material_theme; sleep 60; retry
bench get-app https://github.com/venkat-narasimha/erp_material_theme.git

# Patch runs automatically during install-app (registered in patches.txt)
bench --site <site> install-app material_theme
# Expect: "Updating Dashboard for material_theme" → patch logs "Successfully added ['Material']"

# Verify patch landed
bench --site <site> execute 'frappe.get_meta("User").get_field("desk_theme").options'
# Expect: Light\nDark\nAutomatic\nMaterial

# Build assets (all apps — see [Pitfall #1](#pitfall-1-bench-build--app-x-wipes-other-apps-assets))
bench build

exit
```

### Why `bench build` (not `bench build --app material_theme`)?

`bench build --app X` only rebuilds app X's assets. Frappe's build process can clean other apps' bundle outputs. After install-app, always run `bench build` (no `--app`) to regenerate all bundles with consistent hashes.

---

## Install on Frappe v15

Same procedure as v16. The fork's v16 patches are also v15-safe (verified on `dev-erp.duckdns.org` with Frappe 15.104.0, ERPNext 15.103.1).

```bash
docker exec -it -u frappe <env>-backend-1 bash
cd /home/frappe/frappe-bench
bench get-app https://github.com/venkat-narasimha/erp_material_theme.git
bench --site <site> install-app material_theme
bench --site <site> execute 'frappe.get_meta("User").get_field("desk_theme").options'
# Expect: Light\nDark\nAutomatic\nMaterial
bench build
exit
```

**No fork changes required for v15.** The `fieldname` kwarg, `ignore_validate=True`, and `clear_cache(doctype=...)` are accepted in v15 too. The `app_ready` event exists in v15 too.

---

## Asset sync (mandatory after install)

After `bench build` on the backend, the frontend container still serves the **image's prebuilt assets** because Docker creates **separate anonymous volumes** for `/sites/assets` on backend and frontend (see [Pitfall #2](#pitfall-2-asset-volume-shadowing)).

You must copy new assets from backend → frontend using `docker cp` via a host intermediate.

**Always per-directory copy. Never bulk copy.**

```bash
# 1. Stage from backend → host (one directory at a time)
docker cp <env>-backend-1:/home/frappe/frappe-bench/sites/assets/material_theme/ /tmp/_mt/
docker cp <env>-backend-1:/home/frappe/frappe-bench/sites/assets/assets.json /tmp/_assets.json
docker cp <env>-backend-1:/home/frappe/frappe-bench/sites/assets/assets-rtl.json /tmp/_assets-rtl.json

# 2. Push from host → frontend (same pattern)
docker cp /tmp/_mt/. <env>-frontend-1:/home/frappe/frappe-bench/sites/assets/material_theme/
docker cp /tmp/_assets.json <env>-frontend-1:/home/frappe/frappe-bench/sites/assets/assets.json
docker cp /tmp/_assets-rtl.json <env>-frontend-1:/home/frappe/frappe-bench/sites/assets/assets-rtl.json

# 3. Cleanup
rm -rf /tmp/_mt /tmp/_assets.json /tmp/_assets-rtl.json
```

For per-app bundle sync (after `bench build` of all apps):

```bash
# Stage frappe bundle
docker cp <env>-backend-1:/home/frappe/frappe-bench/sites/assets/frappe/ /tmp/_frappe/
docker cp /tmp/_frappe/. <env>-frontend-1:/home/frappe/frappe-bench/sites/assets/frappe/

# Stage erpnext bundle
docker cp <env>-backend-1:/home/frappe/frappe-bench/sites/assets/erpnext/ /tmp/_erpnext/
docker cp /tmp/_erpnext/. <env>-frontend-1:/home/frappe/frappe-bench/sites/assets/erpnext/

# Cleanup
rm -rf /tmp/_frappe /tmp/_erpnext
```

**Why per-directory?** Bulk `docker cp container:path container:path` is **not supported** by Docker (error: `copying between containers is not supported`). Tar-pipe (`docker exec container1 tar | docker exec container2 tar`) is fragile — silent skip is common on anonymous volumes. Host intermediate + per-directory is the proven method.

### After asset sync: restart frontend (sometimes)

If assets 404 after sync (rare with per-directory method), restart the frontend nginx:

```bash
docker restart <env>-frontend-1
sleep 5
```

---

## Common pitfalls + fixes

### Pitfall #1: `bench build --app X` wipes other apps' assets

`bench build --app material_theme` rebuilds only material_theme. Frappe's build process can clean other apps' bundle output. After install-app, **always run `bench build` (no `--app`)** to regenerate all bundles.

**Symptom:** Browser shows 404 (or 502 if nginx proxies asset requests to backend) for `desk.bundle.*.css`, `erpnext.bundle.*.css`, etc., even though material_theme assets load fine.

**Fix:** `bench build` (all apps), then per-directory asset sync.

### Pitfall #2: Asset volume shadowing

Docker Compose creates **anonymous volumes** for `/sites/assets` on BOTH backend and frontend containers. They don't share.

Confirmed via `docker inspect`:
```
backend:  /var/lib/docker/volumes/<hash1>/_data -> /home/frappe/frappe-bench/sites/assets
frontend: /var/lib/docker/volumes/<hash2>/_data -> /home/frappe/frappe-bench/sites/assets
```

The named `sites` volume covers the parent path but the anonymous volumes shadow the `assets/` subdirectory.

**Symptom:** Browser 404 on assets after backend rebuild, even though `bench build` succeeded.

**Fix:** Per-directory `docker cp` from backend → host → frontend (see [Asset sync](#asset-sync-mandatory-after-install)).

### Pitfall #3: `ModuleNotFoundError: No module named 'material_theme'` after install

Backend gunicorn workers were running **before** `bench install-app material_theme`. Their Python env doesn't have the new module. `bench install-app` adds it to the env, but workers don't reload.

**Symptom:** 500 on every endpoint. Traceback: `ModuleNotFoundError: No module named 'material_theme'` in `_load_app_hooks()`.

**Fix:**
```bash
docker restart <env>-backend-1
sleep 10
# Also restart frontend to clear nginx DNS cache (lesson from 2026-08-03):
docker restart <env>-frontend-1
sleep 5
curl -sk -I -H 'Host: <site>' https://<site>/api/method/ping
# Expect: HTTP/1.1 200 OK
```

### Pitfall #4: Frontend nginx upstream points to wrong hostnames

Frontend container's `/etc/nginx/conf.d/frappe.conf` (image default) uses `upstream backend-server { server backend:8000; }` and `upstream socketio-server { server websocket:9000; }`.

On multi-container hosts (e.g., clawb-nginx + ERPNext + other apps), `backend` and `websocket` hostnames resolve to **multiple IPs** (every container with that name on any shared network). nginx picks randomly.

**Symptom:** Random 502 on `/api/`, `/socket.io/`, etc. Different responses each request.

**Fix:** Override upstream to use Compose's prefixed container names:
```bash
docker exec <env>-frontend-1 sed -i 's|server backend:8000|server <env>-backend-1:8000|' /etc/nginx/conf.d/frappe.conf
docker exec <env>-frontend-1 sed -i 's|server websocket:9000|server <env>-websocket-1:9000|' /etc/nginx/conf.d/frappe.conf
docker exec <env>-frontend-1 nginx -t
docker exec <env>-frontend-1 nginx -s reload
```

**Note:** This fix is **lost on container recreate**. Apply it at install time AND on every container recreate.

### Pitfall #5: clawb-nginx missing `location /socket.io`

If your external nginx (e.g., `clawb-nginx`) proxies to backend directly via `location /`, **socket.io requests fall to backend which doesn't handle them**. Result: 404 on `/socket.io/?EIO=4&transport=polling`.

**Fix:** Add explicit `location /socket.io` to clawb-nginx server block, routing to `frontend:8080` (which has the proper `/socket.io` proxy with `X-Frappe-Site-Name` + `Origin` headers + proxy to `websocket:9000`):

```nginx
location /socket.io {
    proxy_pass http://<env>-frontend-1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

Insert **before** the catch-all `location / { ... }` block in clawb-nginx's server config.

### Pitfall #6: bulk `docker cp` cross-container

`docker cp <container>:<path> <container>:<path>` is **not supported** by Docker. Always use `container → host → container`.

---

## Verify

After install + asset sync + (if needed) container restarts:

```bash
# 1. desk_theme options include Material
docker exec <env>-backend-1 bench --site <site> execute \
  'frappe.get_meta("User").get_field("desk_theme").options'
# Expect: Light\nDark\nAutomatic\nMaterial

# 2. Material assets exist on backend
docker exec <env>-backend-1 ls /home/frappe/frappe-bench/sites/assets/material_theme/
# Expect: css  js

# 3. Material assets synced to frontend
docker exec <env>-frontend-1 ls /home/frappe/frappe-bench/sites/assets/material_theme/
# Expect: css  js

# 4. API healthy
curl -sk -I -H 'Host: <site>' https://<site>/api/method/ping
# Expect: HTTP/1.1 200 OK

# 5. Browser
# - Hard reload https://<site>/desk (Ctrl+Shift+R)
# - Login as Administrator
# - Press Shift+Ctrl+G (theme picker shortcut)
# - Look for "Material by Itrostack" card
# - Click → theme renders
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'material_theme'` | Backend workers not restarted | [Pitfall #3](#pitfall-3-modulenotfounderror-no-module-named-material_theme-after-install) |
| All assets 404 / 502 after install | Asset volume shadowing | [Pitfall #2](#pitfall-2-asset-volume-shadowing) + asset sync |
| Random 502 on `/api/` calls | Frontend nginx upstream hostname mismatch | [Pitfall #4](#pitfall-4-frontend-nginx-upstream-points-to-wrong-hostnames) |
| 404 on `/socket.io/` polling | clawb-nginx missing `location /socket.io` | [Pitfall #5](#pitfall-5-clawb-nginx-missing-location-socketio) |
| `bench get-app` 503 from GitHub | Transient GitHub rate limit | `rm -rf apps/erp_material_theme; sleep 60; retry` |
| `docker cp container:path container:path` errors with "copying between containers is not supported" | Cross-container cp unsupported | [Pitfall #6](#pitfall-6-bulk-docker-cp-cross-container) |
| Theme picker doesn't show Material option after install | Patch didn't run | `bench --site <site> execute 'frappe.clear_cache(doctype="User")'` then re-check |
| Theme renders blank/unstyled | Material assets not on frontend | Re-run [Asset sync](#asset-sync-mandatory-after-install) |
| `patch` not run during install | patches.txt not committed | Verify `cat material_theme/patches.txt` shows `material_theme.patches.add_theme_setting_user` |

---

## Reference: project history

This fork was created to make the upstream itrostack material_theme (last pushed 2025-08-04, MIT-licensed, vendored Apache-2.0 Material Color Utilities) work on **Frappe v16**.

**Original research:** `memory/research/2026-08-03-itrostack-material-theme-deep-dive.md` (full code analysis, license confirmation, why fork was needed).

**Install runbook:** `memory/projects/2026-08-03-material-theme-install.md` (timeline of pberpDEV install with all 5 patch iterations, debugging, recovery).

**Daily logs:** `memory/daily/2026-08-03.md` (DEV + QA install), `memory/daily/2026-08-04.md` (dev-erp v15 install).

**Note:** These docs live in the OpenClaw workspace (`/root/.openclaw/workspace/`), not in this repo.

### Provenance

| Item | Value |
|---|---|
| Upstream | https://github.com/itrostack/material_theme |
| Fork | https://github.com/venkat-narasimha/erp_material_theme |
| First v16 fix commit | `22a2d3a` |
| Current v16 patch (v5) | `4da8646` |
| Current v16 JS override | `f2a516d` |
| Patch file | `material_theme/patches/add_theme_setting_user.py` |
| JS override file | `material_theme/public/js/theme.js` |
| Patch registration | `material_theme/patches.txt` (in `[post_model_sync]` section) |
| Theme switch override | `material_theme/overrides/switch_theme.py` (registered in `hooks.py`) |

### What the patch does

Adds `"Material"` to the `User.desk_theme` field options via `frappe.make_property_setter()`. Idempotent — re-running doesn't duplicate.

### What the JS override does

Injects a "Material by Itrostack" card into Frappe's theme picker (which is now card-based in v16+, not dropdown). Hooks into Frappe's `app_ready` event (fired after `frappe.Application.startup()`) so the class extension override isn't clobbered by v16's earlier `app_include_js` loading order.

### What the `switch_theme` override does

Allows `desk_theme` to accept `"Material"` as a valid value (the upstream override whitelist expanded `["Dark", "Light", "Automatic"]` to `["Dark", "Light", "Automatic", "Material"]`).

---

**Author:** Venkat + ERPClaw
**Last updated:** 2026-08-04
**Tested on:** Frappe v15.103.1 (dev-erp), v16.13.0 (pberpDEV), v16.17.5 (pberpQA)