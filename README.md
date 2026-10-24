# BingeBox — simple WordPress forms

Signups and title requests now use an ordinary HTML form POST to WordPress's admin-post.php. There is no custom submission REST API, no WordPress API key, and no React submission proxy. Chat and movie discovery still use their own existing APIs.

## Update WordPress
Upload the included bingebox-submissions-simple.zip via Plugins → Add New → Upload Plugin, and replace the existing BingeBox Submissions plugin. Open BingeBox → Settings after updating. Existing submission records and email preferences are retained; the old API key is removed. Remove any duplicate BingeBox theme/functions.php code so it cannot load the old REST backend.

In Settings, enter your exact BingeBox website base URLs, one per line. For example:

https://your-project.vercel.app/
http://127.0.0.1:5173/
http://localhost:5173/

Use your actual Vercel hostname, not the example. If deployed under a subfolder, include that path. The form's return URL must match an entry exactly, including its trailing slash. Do not include #signup, #request, or query parameters. This also restricts redirects to administrator-approved destinations. Ordinary form posts supply an Origin header; submissions without a matching Origin are rejected. Origin validation is not authentication or comprehensive bot protection. Validation, consent checking, retry deduplication and basic IP/email rate limits are retained. Browser autofill is supported; no honeypot field is used. Add host-level bot protection if abuse occurs.

## Update React
Use this entire React project because the old version posts to the removed API. In .env.local or Vercel environment variables set:

VITE_WORDPRESS_FORM_URL=https://bingeboxcc.wordpress.com/wp-admin/admin-post.php
VITE_BANK_NAME=your bank
VITE_BANK_ACCOUNT_NAME=your account name
VITE_BANK_ACCOUNT_NUMBER=your account number
VITE_SUBSCRIPTION_PRICE=your amount, currency and billing period

The plugin Settings page shows the exact form address to use. These settings are public frontend values, not credentials. Remove WORDPRESS_SUBMISSIONS_URL and WORDPRESS_SUBMISSIONS_KEY; they are no longer used. Old server-only BANK_* settings must be copied to the new VITE_BANK_* names. Keep optional GEMINI_API_KEY and TMDB_READ_ACCESS_TOKEN server-only.

Mac Catalina: use Node 18.20.8, run npm ci, copy .env.example to .env.local without overwriting existing secrets, then npm run dev. Browse http://127.0.0.1:5173/. For a built version: npm run build and npm start. Vercel: Vite preset, npm run build, dist output, a currently supported Node runtime. Redeploy whenever VITE_ variables change. Node 18 is retained only for local Catalina compatibility.

## What visitors see
The browser briefly navigates to WordPress to submit. After saving, WordPress redirects to the originating page. Signup then displays your payment details; requests show the saved confirmation. On validation or storage errors, WordPress shows an error page and a back link where applicable. No return redirect is a proof of payment, email delivery or account activation. The frontend uses a session marker only to suppress accidental popup replays, not as an authentication mechanism.

## Admin panel and email
WordPress → BingeBox still supports viewing, searching, filtering, deleting and CSV exports. Email remains optional through existing WordPress wp_mail settings. The plugin saves even if email delivery fails. Payments and Jellyfin credential issuance remain manual. No test mode is used.

## Verification
React TypeScript/build and eight existing chat tests passed. PHP 7.4 syntax parse passed. The package was checked for removal of the REST route, key authentication, React proxy and old credentials. Live WordPress posting, redirects, admin operations and email delivery still need testing on your site; no emails or real submissions were sent during preparation.

## Gemini chatbot

See ../GEMINI-SETUP.txt. Set GEMINI_API_KEY and optionally GEMINI_MODEL in .env.local, then restart the server. The default is gemini-3.5-flash-lite; the saved knowledge base remains the fallback.
# BingeBox
