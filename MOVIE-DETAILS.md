# Movie details and trailers
Homepage carousel and featured poster cards link to #movie/<TMDB ID>.
The existing /api/movies endpoint now supports ?id=<positive TMDB movie ID> and requests details, credits and videos together. The Vercel adapter forwards the request; the local server already passes it through.

Configuration: TMDB_READ_ACCESS_TOKEN must be set server-side in .env.local for local development and in Vercel environment settings for deployment. It is the TMDB API Read Access Token (Bearer token). Do not prefix it with VITE_. Restart the local server or redeploy after changing it.

The page displays overview, genres, runtime, release year, rating with vote count, directors and eight featured cast members. Missing data is omitted or explained. Both desktop and mobile use the same page. Trailers and teasers are sourced from TMDB, with official trailers ranked first. Only validated YouTube or Vimeo video identifiers are embedded. No video iframe is loaded until the visitor chooses to play. A provider link is available for disabled embedding, region restrictions or unavailable videos.

Discovery does not imply Jellyfin availability. The existing title request form remains available from the details page.
Errors show retry and back-to-discovery actions. Route changes abort requests and unmount video playback.
Production build and all 20 mocked/unit tests passed. Live TMDB credentials, browser rendering and third-party video playback were not verified here.
