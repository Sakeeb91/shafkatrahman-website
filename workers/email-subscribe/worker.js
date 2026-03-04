export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://shafkatrahman.com',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': 'https://shafkatrahman.com' },
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

    const data = await res.json();

    return new Response(JSON.stringify({ ok: res.ok }), {
      status: res.ok ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://shafkatrahman.com',
      },
    });
  },
};
