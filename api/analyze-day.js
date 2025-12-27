export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dayData } = req.body;

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
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Ты эксперт по календарю Tzolkin. Проанализируй день пользователя и дай краткую рекомендацию (2-3 предложения).

Данные дня:
- Тон: ${dayData.tone}
- Печать: ${dayData.seal}
- Энергия: ${dayData.energy}
- Резонанс с печатью: ${dayData.resonance}
- Делать или быть: ${dayData.action}
- Стадия проекта: ${dayData.project}
- Ключевое событие: ${dayData.insight}
- Заметки: ${dayData.notes || 'нет'}

Дай практический совет на основе этих данных.`
        }]
      })
    });

    const data = await response.json();
    const advice = data.content[0].text;

    res.status(200).json({ advice });
  } catch (error) {
    console.error('Ошибка Claude:', error);
    res.status(500).json({ error: 'Ошибка анализа' });
  }
}