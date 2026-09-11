# Security Coding Checklist

A clean, local-only manual review tool for developers. It provides 112 technology-agnostic security checks across authentication, authorization, APIs, deployment, and more. It is a review aid—not a vulnerability scanner, security score, or certification.

## Features

- 112 concise security checks organized into 28 collapsible categories
- Local browser persistence for project information and checked items
- Search by category, check title, and rule ID
- Overall and category-level checklist progress
- Clear checklist confirmation (project information is retained)
- Local, multi-page PDF report with checked and unchecked items
- Responsive, accessible UI with no account, backend, database, API key, or external data collection

## Tech stack

Next.js, React, TypeScript, CSS, browser LocalStorage, and jsPDF.

## Local development

Install Node.js 20.9 or newer (current LTS is recommended), then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). All checklist data stays in that browser's local storage.

## Production build

```bash
npm run build
npm run start
```

Open the local URL printed by Next.js and verify project fields, checking, search, reset, and PDF generation.

## Deploy to Vercel

### 1. Create and push a Git repository

From this project directory:

```bash
git init
git add .
git commit -m "Initial commit"
```

Create an empty repository in GitHub, copy its repository URL, then run:

```bash
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

Do not replace `<repository-url>` with an invented value; paste the URL GitHub provides.

### 2. Create a Vercel project

1. Open [Vercel](https://vercel.com) and sign in with GitHub.
2. Select **Add New…**, then **Project**.
3. Import the GitHub repository.
4. Confirm that Vercel detects Next.js.
5. Keep the default build settings and deploy.

No environment variables are required.

The deployment includes basic browser hardening headers (frame blocking, MIME-sniffing protection, a strict referrer policy, and disabled camera/microphone/geolocation permissions). No checklist or project data is sent to Vercel: it remains in each user’s browser LocalStorage.

### 3. Verify the deployment

Open Vercel’s deployment URL. Enter project information, check several items, and refresh to confirm local persistence. Test **Clear Checklist** (the project details remain), then create a PDF report. Browser storage is per browser/device, so it is not shared with Vercel or other users.

### 4. Optional custom domain

Vercel supplies a default deployment URL. If you later own a domain, open the Vercel project’s **Settings → Domains**, add the domain, and follow the DNS instructions. A custom domain is optional.

### 5. Future updates

Each push triggers a new Vercel deployment:

```text
Local change → git add . → git commit → git push → Vercel redeploys
```

## Troubleshooting

**Build fails:** Run `npm run build` locally and resolve TypeScript or dependency errors before deploying.

**PDF does not work:** Use a current desktop/mobile browser, check the browser console, and make sure downloads are permitted.

**LocalStorage does not persist:** Check privacy settings, private/incognito mode, and whether the site is running in a restricted storage context.

**Vercel deployment fails:** Check the build command, Node compatibility, package installation, and local TypeScript/build output.
