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
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: `Проанализируй 13-дневную волну Tzolkin. Найди паттерны и дай развёрнутый анализ в Markdown.

Правила:
1) Не используй эмодзи/пиктограммы/иконки.
2) Пиши конкретно, без мистики и общих фраз.
3) Если данных недостаточно для вывода — явно отметь это.

Данные за ${waveDays.length} дней:
${JSON.stringify(waveDays, null, 2)}

Структура ответа:
### Итог волны
[2-3 предложения]

### Паттерны по тонам
- Где энергия была выше/ниже (с примерами тонов)

### Делать vs быть
- Что повторялось и к чему это приводило

### Проекты и заметки
- Динамика по стадиям/контексту

### Рекомендации на следующую волну
- 3-5 конкретных действий`
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