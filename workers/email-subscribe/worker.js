const ALLOWED_ORIGINS = [
  'https://shafkatrahman.com',
  'https://www.shafkatrahman.com',
  'https://shafkatrahman.pages.dev',
];

function getCorsOrigin(request) {
  const origin = request.headers.get('Origin') || '';
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

export default {
  async fetch(request, env) {
    const corsOrigin = getCorsOrigin(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const { email } = await request.json();
      if (!email) {
        return new Response(JSON.stringify({ error: 'Email required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': corsOrigin,
          },
        });
      }

      const res = await fetch(
        `https://emailoctopus.com/api/1.6/lists/${env.EO_LIST_ID}/contacts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: env.EO_API_KEY,
            email_address: email,
          }),
        }
      );

      return new Response(JSON.stringify({ ok: res.ok }), {
        status: res.ok ? 200 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Bad request' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
        },
      });
    }
  },
};
