# Static hosting

SomnaShift needs a static host. The app and guided demo use no backend, secrets or build-time dependencies. Optional local search fetches its pinned runtime and model after explicit opt-in.

## GitHub Pages

The public project is [RobertVaganian/somnashift](https://github.com/RobertVaganian/somnashift). Its Pages deployment uses the workflows included here. For a separate copy:

1. Create an empty repository named `somnashift` and upload this project, including `.github/workflows/`.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
3. Run **Publish Pages** from the Actions tab, or push to `main` after enabling Pages.
4. Wait for a successful deployment. Use the URL returned by the deployment job, then check the case study, a sample handoff and local search before sharing it.
5. Replace the hosted-preview links in `README.md` with that verified URL. Keep any project subpath, such as `/somnashift/`.

The **Verify** workflow runs syntax checks, tests and the static build on pushes and pull requests. **Publish Pages** repeats those checks before deploying `dist/`. Neither workflow writes source commits. Node.js 22 is selected explicitly; there is no dependency-install step because the application has no npm dependencies.

Pages availability depends on repository visibility and the account’s plan. Other hosted previews have their own access settings, independent of GitHub visibility.

## Other static hosts

Run `npm run build` and publish `dist/`. Route folders contain static HTML entries for `/shift`, `/now`, `/actions`, `/updates`, `/watch` and `/case-study`; assets use relative paths, including project subpaths. A fallback `404.html` is included.

Use HTTPS or localhost for browser capabilities. Permit the pinned runtime and model hosts if your deployment applies a content-security policy; inspect `dist/brief-worker.mjs` before setting that policy. Don’t embed API keys or real patient data.

## Source export

```sh
python scripts/export-source.py /absolute/path/somnashift-source.zip
```

The export includes source, tests, documentation, media, fonts, notices and GitHub workflows. Git metadata, hosting-account configuration, secrets, caches and temporary files are excluded. This does not change the working repository or its history.
