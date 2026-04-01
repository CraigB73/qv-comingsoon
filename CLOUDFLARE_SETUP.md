# Cloudflare Turnstile Setup

This repo is prepared to use Cloudflare Turnstile with a Pages Function at `/api/enquiry`.

## 1. Create a Turnstile site

In Cloudflare:

1. Go to `Turnstile`
2. Create a new widget/site
3. Add your production domain and any preview/local domains you need
4. Copy:
   - `Site Key`
   - `Secret Key`

## 2. Add the site key to the frontend

Update the placeholder in [index.html](/Users/craigb73/Dev_Project/qv-comingsoon-/index.html):

```html
<meta name="turnstile-site-key" content="YOUR_TURNSTILE_SITE_KEY">
```

Replace `YOUR_TURNSTILE_SITE_KEY` with your real Turnstile site key.

## 3. Add Cloudflare environment variables

In Cloudflare Pages project settings, add:

- `TURNSTILE_SECRET_KEY`
  Use your Turnstile secret key

- `FORM_RECIPIENT`
  Optional. If omitted, the function defaults to:
  `info@quotevector.com`

## 4. Deploy

Deploy the site to Cloudflare Pages.

Before deploying, verify these Pages settings to avoid `405 Method Not Allowed` on `/api/enquiry`:

1. The Pages project root is the repo root, or the configured project root contains both:
   - `index.html`
   - `functions/api/enquiry.js`
2. The build output directory is not pointing to a subdirectory that excludes `functions/`
3. The deployment includes:
   - `functions/api/enquiry.js`
   - `_routes.json`
4. After changing Functions, routes, or env vars, trigger a fresh redeploy

The form will now:

1. render the Turnstile widget in the browser
2. submit to `/api/enquiry`
3. verify the Turnstile token server-side
4. forward the form to FormSubmit only after verification succeeds

## 5. Test

After deployment:

1. Open the live site
2. Fill in the form
3. Complete the Turnstile challenge
4. Submit the form
5. Confirm the success state appears
6. Confirm the email arrives in the target inbox

## Notes

- If you see `Turnstile is not configured yet`, the site key in `index.html` is still the placeholder.
- If the form fails with verification errors, check that `TURNSTILE_SECRET_KEY` is set correctly in Cloudflare.
- If `POST /api/enquiry` returns `405`, check:
  - the Pages project is deploying this exact repo and branch
  - the project root/build output is not excluding `functions/`
  - `_routes.json` is present in the deployed root
  - a fresh deployment has completed after the latest function changes
- If verification succeeds but no email arrives, verify your FormSubmit setup and recipient inbox.
