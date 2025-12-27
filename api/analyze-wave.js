export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { waveDays } = req.body;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Проанализируй 13-дневную волну Tzolkin. Найди паттерны и дай развёрнутый анализ (5-7 предложений).

Данные за ${waveDays.length} дней:
${JSON.stringify(waveDays, null, 2)}

Определи:
1. В какие тоны энергия была выше/ниже
2. Паттерны поведения (делать vs быть)
3. Динамику проектов
4. Общий вывод и рекомендации на следующую волну`
        }]
      })
    });

    const data = await response.json();
    const analysis = data.content[0].text;

    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Ошибка Claude:', error);
    res.status(500).json({ error: 'Ошибка анализа волны' });
  }
}