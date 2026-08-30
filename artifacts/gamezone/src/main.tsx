import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Point the client at the deployed API. Without it, requests hit the static
// host and come back as HTML, which crashes every data page.
const apiUrl = import.meta.env.VITE_API_URL || 'https://gamezoneapi-cp623ub2.manus.space';
setBaseUrl(apiUrl);

// Publishable key is safe to expose in client code by design (unlike the
// secret key, which only ever lives on the backend).
const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  'pk_test_c2tpbGxlZC1tYW1tb3RoLTMyNzAuY2xlcmsuYWNjb3VudHMuZGV2JA';

createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={clerkPublishableKey}>
    <App />
  </ClerkProvider>,
);
