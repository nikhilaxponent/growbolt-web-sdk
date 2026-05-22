GrowBolt SDK Playground

How to use

1. Build the SDK and copy the bundle into the playground (recommended):

```bash
# from project root
npm run build:playground

# then serve the playground folder
npm run serve:playground
```

If you prefer manual steps:

```bash
# Option A - python (quick, built-in)
cd playground && python3 -m http.server 8000
# open http://localhost:8000

# Option B - npm 'serve' (nicer)
npx serve playground
# open the URL printed by 'serve'
```

3. Open the playground URL in your browser. The page will load `../dist/sdk.js` and show a small UI.

What the playground does

- Loads `dist/sdk.js` into window
- Provides buttons to check, initialize and destroy the SDK
- Prints logs to both the browser console and the in-page log panel

Notes & suggestions for SDK testing

- Add a small demo config and an example `init` payload for deterministic tests.
- Consider adding a dev script that copies the latest `dist` into `playground/` automatically after build.
- Add unit tests for lifecycle functions (`init`, `destroy`) and expose a test-mode flag to avoid side-effects when running E2E tests.
- For automated E2E, use Playwright to open the playground and assert logs and DOM changes.
