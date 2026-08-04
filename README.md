## Material Theme

Material Theme by Itrostack LLP — Venkat's fork with v16 compatibility fixes.

Making Frappe more colorful with Material Design.

![sc_1](https://github.com/user-attachments/assets/e2268b1c-2610-4ee6-a307-df966d27bb82)
![sc_2](https://github.com/user-attachments/assets/f2b32ab8-d85c-4a24-a8f7-388d22e51270)
![sc_3](https://github.com/user-attachments/assets/921377d8-840c-4d91-9f0c-e9d523c078b1)
![sc_4](https://github.com/user-attachments/assets/7a8e7319-e33f-454a-b6a9-eff3e2657e64)
<img width="2871" height="1497" alt="image" src="https://github.com/user-attachments/assets/3247ca6d-ea2d-4535-a32e-1b0e77ec8410" />

---

## Quick install

```bash
bench get-app https://github.com/venkat-narasimha/erp_material_theme.git
bench --site <your-site> install-app material_theme
bench build
```

**For full installation, configuration, and troubleshooting guide, see [`INSTALLATION.md`](./INSTALLATION.md).**

That doc covers:
- Install on Frappe v15 + v16 (verified paths)
- What the v16 patches change (and why they're also v15-safe)
- Mandatory asset sync (per-directory `docker cp` pattern)
- Six common pitfalls + fixes (asset volume shadowing, `ModuleNotFoundError`, nginx upstream hostname mismatches, missing `location /socket.io`, etc.)
- Verify checklist
- Troubleshooting table

---

## Versions

Tested on:
- Frappe v15.103.1 (dev-erp.duckdns.org)
- Frappe v16.13.0 (pberpdev.duckdns.org)
- Frappe v16.17.5 (pberpqa.duckdns.org)

## License

mit (inherited from upstream itrostack/material_theme)