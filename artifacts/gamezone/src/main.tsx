import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { setBaseUrl } from '@workspace/api-client-react';
import { clerkAppearance } from './lib/clerk-appearance';

import App from './App';

import './index.css';

// Point the client at the deployed API. Without it, requests hit the static
// host and come back as HTML, which crashes every data page.
const apiUrl = import.meta.env.VITE_API_URL || 'https://gamezoneapi-cp623ub2.manus.space';
setBaseUrl(apiUrl);

// Publishable key must come from env / CI secrets — never hardcode a live key.
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
  console.error(
    'Missing VITE_CLERK_PUBLISHABLE_KEY. Set it in .env and GitHub Actions secrets.',
  );
}

createRoot(document.getElementById('root')!).render(
  <ClerkProvider
    publishableKey={clerkPublishableKey || ''}
    appearance={clerkAppearance}
    afterSignOutUrl={import.meta.env.BASE_URL || '/'}
  >
    <App />
  </ClerkProvider>,
);
