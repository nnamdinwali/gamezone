import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter, setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Point the client at the deployed API. Without it, requests hit the static
// host and come back as HTML, which crashes every data page.
const apiUrl = import.meta.env.VITE_API_URL || 'https://gamezoneapi-cp623ub2.manus.space';
setBaseUrl(apiUrl);

// The site (github.io) and the API (manus.space) are different origins, so the
// browser never sends Clerk's session cookie with API calls. Without a token
// the server sees every request as anonymous: /users/me returns 401, no player
// row is ever created, and the leaderboard, balance and profile stay empty.
// Attach the Clerk session token as a bearer instead. Clerk publishes itself on
// window.Clerk once <ClerkProvider> mounts.
declare global {
  interface Window {
    Clerk?: { session?: { getToken: () => Promise<string | null> } | null };
  }
}

setAuthTokenGetter(async () => {
  try {
    return (await window.Clerk?.session?.getToken()) ?? null;
  } catch {
    return null;
  }
});

createRoot(document.getElementById('root')!).render(<App />);
