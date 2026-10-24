// Public settings only. No WordPress API key is needed.
const env=import.meta.env;
export const FORM_URL=env.VITE_WORDPRESS_FORM_URL||'';
export const bankDetails={bank:env.VITE_BANK_NAME||'',accountName:env.VITE_BANK_ACCOUNT_NAME||'',accountNumber:env.VITE_BANK_ACCOUNT_NUMBER||'',price:env.VITE_SUBSCRIPTION_PRICE||'Contact us for pricing'};
