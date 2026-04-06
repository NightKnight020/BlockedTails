/**
 * BlockedTails API Proxy — Cloudflare Worker
 * Deploy at: workers.cloudflare.com
 * Route: api.blockedtails.com/*
 *
 * This keeps your API key server-side and fixes CORS
 * so the browser can fetch live flight data.
 */

const ADSB_KEY  = '0b616e6bb7msh7bca2a9c0b72d5ap18774bjsna04e271b0aca';
const ADSB_HOST = 'adsbexchange-com1.p.rapidapi.com';

// Only allow requests from your domain
const ALLOWED_ORIGINS = [
  'https://blockedtails.com',
  'https://www.blockedtails.com',
  'https://nightknight020.github.io', // keep during transition
  'http://localhost:8080',            // local dev
];

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin) || origin === '';

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': allowed ? origin : 'https://blockedtails.com',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    const url = new URL(request.url);

    // Route: /v2/lat/{lat}/lon/{lon}/dist/{dist}/
    // Route: /v2/icao/{icao}/
    // Route: /v2/callsign/{callsign}/
    const path = url.pathname;
    const apiUrl = `https://${ADSB_HOST}${path}`;

    try {
      const apiResp = await fetch(apiUrl, {
        headers: {
          'x-rapidapi-key':  ADSB_KEY,
          'x-rapidapi-host': ADSB_HOST,
        }
      });

      const data = await apiResp.json();

      return new Response(JSON.stringify(data), {
        status: apiResp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowed ? origin : 'https://blockedtails.com',
          'Cache-Control': 'no-store', // always fresh data
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
  }
};
