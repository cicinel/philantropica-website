# Philantropica website

The public website at https://philantropica.co, exported on 27 October 2026, with essays temporarily unpublished on 2 November and the vault updated to Seamless 0.8.5 on 6 November 2026. It includes the approved About Us text, styles, scripts, fonts, images and all desktop/mobile animation variants.

The inactive essay pages and media are retained in `deactivated/`, outside the publishable `site/` directory, and in Git history. A complete backup is also retained locally in `archives/website-before-essays-disabled-2026-11-02.tar.gz`. That duplicate archive is excluded from Git. Production Worker version `51daa617-e545-489f-a3d1-094433873192` removes essay links and sitemap entries and returns HTTP 404 for essay/mission routes. Previous version `d15f1ff5-11ae-49b5-bc83-c852b51e87b1` is retained for rollback. The Pages origin and access services were preserved.

## Preview

Videos are stored with Git LFS. After cloning, fetch them with:

```sh
git lfs install
git lfs pull
```

Install [Git LFS](https://git-lfs.com/) first if it is not already available.

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory site
```

Open http://127.0.0.1:8765. Main active routes are `/`, `/seamless/` and `/about/`. No frontend build or package installation is required.

## Files

- `site/`: editable production HTML, CSS and JavaScript, plus the media used by the live pages. Absolute first-party asset references are made local for preview.
- `cloudflare/edge/`: the current deployed `seamless-hero-video` Worker and footer module. It serves the latest product video and laptop media and applies the approved About copy and display corrections over the Pages origin.
- `cloudflare/vault/`: the deployed installer-access Worker and its database schema. Installer binaries and visitor records are private and are not included.
- `cloudflare/access-mail/`: the deployed early-access notification Worker.
- `deactivated/`: preserved essay pages, stylesheet and images.
- `licenses/`: bundled third-party notices and font/model licenses.
- `asset-manifest.json`: file hashes and sizes for this export.

## Hosting and server dependencies

Production uses the existing `seamless-video` Cloudflare Pages project, with separate Workers for the edge modifications, installer vault and access notifications. This repository upload does not change that deployment or enable automatic deployment.

The `site/` HTML already includes the effects of the production edge Worker. For a new static deployment, use `site/` directly. Do not apply the archived edge transformations a second time. Before replacing the existing Pages origin, reconcile those transformations with the current Worker.

The early-access form posts to `/api/access`. Its original Pages Function source was not available in the local source tree or the supported deployment export. The existing production Function remains deployed; this repository contains its frontend and notification Worker, but not that Function. A plain local/static preview cannot submit early-access requests.

The notification Worker requires `ACCESS_DB`, `EMAIL` and `RECIPIENT` bindings. The vault requires its `DB` and private `ASSETS` bindings. Configure these in Cloudflare. Credentials, session data, database contents and private installers are excluded.

## Media credits

The Blender comparison uses the Barcelona Pavilion scene by eMirage / Hamza Cheggour, with base model and textures by Claudio Andres, based on architecture by Ludwig Mies van der Rohe. Blender lists the scene under CC BY: https://www.blender.org/download/demo-files/. Render recordings are shown at four times their recorded speed. Robot and laptop model notices are in `licenses/`.

Original website and brand content remain the property of their respective owners. Third-party assets retain their own licenses.
