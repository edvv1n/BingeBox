# Watch Now
Set VITE_JELLYFIN_SERVER_URL to your public HTTPS Jellyfin address, including any base path. Example only: https://media.example.com/jellyfin/
Put it in .env.local locally and in Vercel's environment settings, then rebuild/redeploy. No credentials or tokens belong in this public variable.

Desktop opens the server in a new tab. Mobile performs a best-effort launch using VITE_JELLYFIN_ANDROID_APP_URL (default jellyfin://) or VITE_JELLYFIN_IOS_APP_URL (default org.jellyfin.expo://). These are launch candidates, not a guaranteed cross-platform Jellyfin deep-link contract. The official Jellyfin projects have open deep-link support issues; a particular installed release may not register these schemes. Override only with a supported jellyfin:// or org.jellyfin.expo:// link verified on your app version.

The mobile dialog remains available with Watch in browser, Copy server address and Get the Jellyfin app. No automatic sign-in or server onboarding is attempted, and no forced timed redirect interrupts the app. The website cannot reliably detect whether the app is installed.
An unconfigured or invalid server URL shows a support message instead of navigating to a broken destination.

Validation: URL validation, mobile/iPad detection and scheme restriction tests passed. Actual mobile app handoff and your server have not been tested.
