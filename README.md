# Psychoaktive Substanzen – Interaktive Map

Deployment-ready static site for GitHub Pages.

## Upload to GitHub Pages

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, choose:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (or `master`), folder `/root`
5. Save.
6. GitHub will publish the site at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

## Files

- `index.html` – app entry point
- `assets/styles.css` – styles
- `assets/app.js` – interaction and rendering logic
- `.nojekyll` – prevents Jekyll processing on GitHub Pages
- `404.html` – fallback copy of the app entry point

## Notes

- No external CDN dependencies
- Static HTML/CSS/JS only
- Works on GitHub Pages, Netlify, Vercel, Cloudflare Pages
