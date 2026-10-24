/** Owner-maintained facts. Runtime commercial details override no facts from visitors. */
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type Article = { id: string; title: string; content: string; pattern: RegExp };
export const SUPPORT_EMAIL = 'b1ng3b0x@gmail.com';
export function knowledgeBase(env: Record<string, string | undefined> = {}): Article[] {
  const open = Boolean(env.VITE_WORDPRESS_FORM_URL);
  return [
    {id:'watch',title:'Watch Now for existing members',pattern:/watch now|already.*(member|user|account)|existing.*(member|user|account)/i,
      content:'Already have your BingeBox login? Select Watch Now. On desktop it opens the configured Jellyfin server. On mobile it attempts to launch the app and offers Watch in browser if the app does not open. You can copy the server address into Jellyfin and sign in with your existing credentials. App launch support varies by device and app version; this chat cannot sign you in.'},

    { id: 'submission', title: 'Form submission help', pattern: /\b(form|submit|submission|submissions|autofill|consent|checkbox|spam.check)\b|send.*request|not.*sending/i,
      content: 'You can use browser autofill for your name and email. Check the consent box before submitting. BingeBox shows a confirmation after a successful submission; an error is not a confirmation. If a form fails, check the highlighted details and retry. After several attempts, wait a few minutes. For continuing problems, email '+SUPPORT_EMAIL+' with the error message. Chat cannot check whether a submission was received.' },
    { id: 'privacy', title: 'Privacy and safe support', pattern: /\b(privacy|private|personal|data|secure|security|otp|card)\b|delete my data/i,
      content: 'The forms ask for your name and email to process your signup or title request and contact you about it. Do not share passwords, one-time codes, card details or payment receipts in chat. AI may process chat messages when available. For privacy questions or a data deletion request, email '+SUPPORT_EMAIL+'. This chat cannot delete records.' },
    { id: 'about', title: 'About BingeBox', pattern: /what is bingebox|about bingebox|how does bingebox work/i,
      content: 'BingeBox is an independently operated viewing service powered by Jellyfin. You can sign up on this site or request a movie or TV show. Login credentials are sent after your subscription is confirmed.' },

    { id: 'pricing', title: 'Subscription pricing', pattern: /how much|cost|price|pricing|fee|plan|expensive|cheap|subscription|monthly|yearly/i,
      content: env.VITE_SUBSCRIPTION_PRICE ? `The configured BingeBox subscription price is ${env.VITE_SUBSCRIPTION_PRICE}. No other plans or discounts are confirmed.` : `BingeBox has not published a subscription price yet. Email ${SUPPORT_EMAIL} for the current amount and billing period before paying.` },
    { id: 'signup', title: 'Joining BingeBox', pattern: /sign.?up|join|register|registration|start|subscribe/i,
      content: `Choose Join BingeBox and provide your name and email. Login credentials are emailed when your subscription is confirmed. ${open ? 'After submitting, follow the payment instructions shown on the site.' : `If the signup form is unavailable, email ${SUPPORT_EMAIL} to get started.`}` },
    { id: 'payment', title: 'Payment and bank transfers', pattern: /\b(pay|paying|payment|payments|bank|transfer)\b|account number/i,
      content: env.VITE_BANK_NAME && env.VITE_BANK_ACCOUNT_NAME && env.VITE_BANK_ACCOUNT_NUMBER ? `Payment is by bank transfer. Bank: ${env.VITE_BANK_NAME}. Account name: ${env.VITE_BANK_ACCOUNT_NAME}. Account number: ${env.VITE_BANK_ACCOUNT_NUMBER}. Use your signup email as the transfer reference. Payment is checked manually by the team; this chat cannot confirm a transfer.` : `Bank transfer details are not published yet. Contact ${SUPPORT_EMAIL} before sending money. The team confirms payments manually; this chat cannot check a transfer.` },
    { id: 'access', title: 'Login credentials and payment follow-up', pattern: /login|log in|credential|password|paid|receipt|activation|access|confirmation|confirm|email.*arriv|how long/i,
      content: `Login credentials are emailed after your subscription is confirmed. If you have paid or are missing that email, check spam and contact ${SUPPORT_EMAIL} with your signup email. There is no confirmed activation timeframe. Chat cannot view accounts, confirm payments, reset passwords, or issue credentials. Never share passwords or one-time codes here.` },
    { id: 'requests', title: 'Requesting movies and TV shows', pattern: /\b(request|requests|movie|movies|film|films|show|shows|series|season|title|titles|available|catalog|catalogue|watch)\b/i,
      content: `Use Request a title, choose Movie or TV Show, and enter your name, email, and title. Add a release year or season to avoid ambiguity. Requests take a maximum of 72 hours to process. Processing does not guarantee that a title will be available to watch. ${open ? '' : 'Online submissions are not open yet; email the team instead. '}Chat does not submit requests or see the Jellyfin catalogue. Poster artwork is discovery content, not proof that a title is available.` },
    { id: 'devices', title: 'Watching and playback help', pattern: /\b(device|devices|tv|phone|android|ios|iphone|jellyfin|buffer|buffering|playback|stream|streaming|screen|app|server)\b/i,
      content: `BingeBox is an independently operated service powered by Jellyfin. The site advertises TV, mobile, tablet, and desktop viewing. Device compatibility, server address, stream limits, resolution, and download options have not been confirmed here. Use the server details supplied with your credentials. For playback trouble, check your connection and restart the app; tell the team your device, app, and error message if it continues.` },
    { id: 'policies', title: 'Subscription policies', pattern: /\b(refund|refunds|cancel|cancellation|trial|discount|renew|renewal|share|sharing|policy|policies)\b/i,
      content: `Refund, cancellation, renewal, free-trial, and account-sharing terms have not been published. Ask ${SUPPORT_EMAIL} for the applicable terms before subscribing. Chat cannot cancel or change an account.` },
    { id: 'contact', title: 'Contacting the team', pattern: /\b(contact|human|team|support|help|email|speak)\b/i,
      content: `Email ${SUPPORT_EMAIL}. Include your signup email for account help. This is automated support, not a live agent; chat messages are not emailed to the team.` },
  ];
}
export function fallbackAnswer(messages: ChatMessage[], articles: Article[], page = 'home') {
  const text = (messages.at(-1)?.content || '').trim().toLowerCase().replace(/[’']/g, "'");
  const find = (id: string) => articles.find(a => a.id === id);
  const direct = articles.filter(a => a.pattern.test(text));
  let matches = direct;
  // Specific support needs outrank broad words such as "email", "help" and "subscription".
  const priority = /watch now|already.*(member|user|account)|existing.*(member|user|account)/.test(text) ? 'watch'
    : /\b(paid|receipt|credentials?|password)\b|log.?in|not received.*email/.test(text) ? 'access'
    : /\b(refund|cancel|renewal|trial|sharing)\b/.test(text) ? 'policies'
    : /\b(autofill|consent|checkbox|submission)\b|form.*(error|fail|work)/.test(text) ? 'submission'
    : /\b(buffering|playback)\b|won.t play/.test(text) ? 'devices'
    : /how much|price|pricing|cost/.test(text) ? 'pricing'
    : /account number|bank|how.*pay/.test(text) ? 'payment' : '';
  if (priority && find(priority)) matches = [find(priority)!];
  // Only explicit short follow-ups inherit a topic; unrelated questions do not.
  if (!matches.length && /^(what about (that|it)|and (that|it)|how do i do (that|it)|where do i do (that|it)|can you explain|tell me more|what next)[?.!]*$/.test(text)) {
    const previous = [...messages.slice(0,-1)].reverse().find(m => m.role === 'user' && articles.some(a => a.pattern.test(m.content)));
    if (previous) return fallbackAnswer([previous], articles, page);
  }
  if (/^(help|help me|it isn.t working|it.s not working)[?.!]*$/.test(text)) {
    const topic = page === 'signup' || page === 'request' ? find('submission') : undefined;
    if(topic) matches = [topic];
  }
  if (/^(hi|hello|hey)[!.\s]*$/.test(text)) return {answer:'Hello! I can help with BingeBox pricing, signup, payments, login access, playback and title requests. What would you like to know?',sources:[]};
  if (/^(thanks|thank you)[!.\s]*$/.test(text)) return {answer:'You’re welcome! Let me know if you need more help with BingeBox.',sources:[]};
  const useful = matches.length > 1 ? matches.filter(a => a.id !== 'contact') : matches;
  if(useful.length) return {answer:useful.slice(0,2).map(a=>a.content).join('\n\n'),sources:useful.slice(0,2).map(a=>a.title)};
  return {answer:`I don’t have a verified answer to that in the BingeBox help information. Is your question about pricing, signup, payment, login, playback or a title request? You can also email ${SUPPORT_EMAIL} for help from the team.`,sources:[]};
}
