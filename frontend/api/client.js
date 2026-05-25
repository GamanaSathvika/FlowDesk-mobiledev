// client.js
import { AppState } from 'react-native';

const BASE_URL = 'https://imaginary-snowbird-nebula.ngrok-free.dev';

async function request(path, options = {}) {
  // We add a timeout so the app doesn't hang forever if the server is down
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        // 🚀 BYPASS LOCALTUNNEL ANTI-PHISHING SPAGE
        'Bypass-Tunnel-Reminder': 'true',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    
    clearTimeout(id);

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.message || `Request failed: ${response.status}`);
    }

    return data;
  } catch (err) {
    clearTimeout(id);
    if (err.name === 'AbortError') throw new Error("Server timeout. Check your IP/Network.");
    throw err;
  }
}

export { BASE_URL, request };