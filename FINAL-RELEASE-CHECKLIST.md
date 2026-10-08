# Final AGPLv3 Release Checklist

Source of truth: `CampusConnect(20261008-090555).zip`
Copyright holder: **Asif Ahamad**
License: **AGPL-3.0-only**

Before pushing the rewritten history:

- [ ] Add `LICENSE`
- [ ] Add `COPYRIGHT.md`
- [ ] Add `THIRD-PARTY-NOTICES.md`
- [ ] Keep all `client/public/branding/*.svg`
- [ ] Keep `client/src/assets/hero.png`
- [ ] Remove `server/uploads/`
- [ ] Remove `_patch_tmp/`
- [ ] Remove `client/README.md`
- [ ] Remove unused Vite asset `client/src/assets/vite.svg`
- [ ] Remove legacy public `favicon.svg` and `icons.svg`
- [ ] Ensure `.env` and `.env.*` are ignored except `.env.example`
- [ ] Set package metadata to `AGPL-3.0-only`
- [ ] Commit the complete final application state
- [ ] Run the history cleanup script
- [ ] Verify unwanted paths are absent from ALL history
- [ ] Run application tests/build
- [ ] Push with `git push --force-with-lease origin main`

Do not use plain `git push --force`.
