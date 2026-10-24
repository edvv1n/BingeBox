# BingeBox support knowledge base

Edit lib/support-knowledge.ts to maintain verified facts and question-matching patterns. This file is shared by the AI prompt, server fallback and browser fallback. Rebuild and redeploy after changes.

Topics: pricing, signup, payments, login/activation, title requests, playback/devices, subscription policies, contact, form problems/autofill/consent, privacy, and an introduction to BingeBox.

Commercial facts come from VITE_SUBSCRIPTION_PRICE, VITE_BANK_NAME, VITE_BANK_ACCOUNT_NAME and VITE_BANK_ACCOUNT_NUMBER. Set these consistently in the deployment environment. Browser values are captured at build time, so environment changes require redeployment. Never put private keys in VITE_ variables or the knowledge base.

Fallback behavior:
- No AI key: server answers from the knowledge base.
- AI failure, rate limit, malformed/empty output or twenty-second provider timeout: server answers from the knowledge base.
- Chat endpoint error, invalid response, network failure or twenty-five-second browser timeout: browser answers from its bundled knowledge base.
- The site must already have loaded; this does not make the entire website available offline.
- Answers show their help topics. Specific intents such as missing login after payment take priority over generic words.
- Explicit short follow-ups reuse the previous question's topic; generic help on a form page uses form guidance.
- Unknown questions ask for clarification and offer the team email. No payments, account status, title availability or policies are invented.
- Chat does not submit forms, verify payments or contact the team.

To update a topic, edit its content and matching pattern and add a representative case to tests/chat.test.mjs. Use npm test and npm run build before redeploying. Keep unconfirmed policies explicit until the owner supplies them.
