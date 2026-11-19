# HTML Pages App (Angular)

Serves static HTML files on their own routes:

| URL                  | File                              |
|----------------------|-----------------------------------|
| `/wah-kabab`         | `src/assets/pages/wah-kabab.html` |
| `/khandar`           | `src/assets/pages/khandar.html`   |
| `/` (home)           | list of all pages                 |

## Run
```bash
npm install
npm start          # opens http://localhost:4200
```

## Add a new page
1. Copy your HTML file into `src/assets/pages/` (e.g. `my-page.html`).
2. Add one line in `src/app/pages.config.ts`:
   ```ts
   { slug: 'my-page', file: 'my-page.html', title: 'My Page' }
   ```
3. Open `http://localhost:4200/my-page`.

## Build for production
```bash
npm run build      # output in dist/html-pages-app/browser
```

### Deploying
Because routes are real paths (`/khandar`), your host must send all unknown
URLs to `index.html`:
- **Netlify:** add `_redirects` containing `/* /index.html 200`
- **Firebase Hosting:** set `"rewrites": [{"source":"**","destination":"/index.html"}]`
- **Nginx:** `try_files $uri $uri/ /index.html;`
- **Apache:** use an `.htaccess` rewrite to `index.html`
