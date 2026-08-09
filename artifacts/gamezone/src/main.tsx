import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Point the client at the deployed API. Without it, requests hit the static
// host and come back as HTML, which crashes every data page.
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) setBaseUrl(apiUrl);

createRoot(document.getElementById('root')!).render(<App />);
