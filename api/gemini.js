export const config = {
  runtime: 'nodejs',
};

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json({ error: 'GEMINI_API_KEY fehlt auf dem Server.' }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Ungültiger JSON-Body.' }, { status: 400 });
  }

  const decision = String(body?.decision || '').trim();
  if (decision.length < 5) {
    return json({ error: 'Bitte gib eine längere Eingabe ein.' }, { status: 400 });
  }

  const payload = {
    contents: [{ parts: [{ text: `Initiale Aktion: "${decision}"` }] }],
    systemInstruction: {
      parts: [
        {
          text:
            'Du bist NEXUS, ein hyper-fortschrittlicher Schmetterlingseffekt-Simulator. Der Nutzer gibt eine kleine, alltägliche Aktion ein. Erschaffe 3 alternative Zeitlinien (Fraktale), die exakt durch diese Aktion ausgelöst werden. Regeln: 1. ALPHA = realistische, aber unerwartete direkte Konsequenz. 2. BETA = wilde absurde Kettenreaktion. 3. OMEGA = surreales oder welterschütterndes Ereignis in ferner Zukunft. Jede Zeitlinie braucht id, type, title, desc, probability. Verwende id in der Reihenfolge ALPHA, BETA, OMEGA.',
        },
      ],
    },
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          timelines: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                type: { type: 'STRING' },
                title: { type: 'STRING' },
                desc: { type: 'STRING' },
                probability: { type: 'STRING' },
              },
              required: ['id', 'type', 'title', 'desc', 'probability'],
            },
          },
        },
        required: ['timelines'],
      },
    },
  };

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || `Gemini-Fehler (${response.status})`;
      return json({ error: message, details: data }, { status: response.status });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return json({ error: 'Leere Antwort von Gemini.', details: data }, { status: 502 });
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json({ error: 'Gemini hat kein valides JSON geliefert.', raw: text }, { status: 502 });
    }

    if (!Array.isArray(parsed?.timelines)) {
      return json({ error: 'Gemini-Antwort hat kein timelines-Array.' }, { status: 502 });
    }

    return json(parsed, { status: 200 });
  } catch (error) {
    return json({ error: error?.message || 'Unbekannter Serverfehler.' }, { status: 500 });
  }
}
