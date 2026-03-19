export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY fehlt auf dem Server.' });
  }

  const decision = (req.body?.decision || '').trim();
  if (decision.length < 5) {
    return res.status(400).json({ error: 'Bitte gib eine längere Eingabe ein.' });
  }

  const payload = {
    contents: [{ parts: [{ text: `Initiale Aktion: "${decision}"` }] }],
    systemInstruction: {
      parts: [
        {
          text:
            "Du bist NEXUS, ein hyper-fortschrittlicher Schmetterlingseffekt-Simulator. Der Nutzer gibt eine kleine, alltägliche Aktion ein. Erschaffe 3 alternative Zeitlinien (Fraktale), die exakt durch diese Aktion ausgelöst werden. Regeln: 1. ALPHA = realistische, aber unerwartete direkte Konsequenz. 2. BETA = wilde absurde Kettenreaktion. 3. OMEGA = surreales oder welterschütterndes Ereignis in ferner Zukunft. Jede Zeitlinie braucht id, type, title, desc, probability. Verwende id in der Reihenfolge ALPHA, BETA, OMEGA.",
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
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message || `Gemini-Fehler (${response.status})`;
      return res.status(response.status).json({ error: message, details: data });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Leere Antwort von Gemini.', details: data });
    }

    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unbekannter Serverfehler.' });
  }
}
