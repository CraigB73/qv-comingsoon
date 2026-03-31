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
- If verification succeeds but no email arrives, verify your FormSubmit setup and recipient inbox.
