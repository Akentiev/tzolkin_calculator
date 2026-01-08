export default async function handler(req, res) {
  console.log('🔵 API вызван');
  console.log('🔵 Есть ключ?', !!process.env.CLAUDE_API_KEY);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dayData } = req.body;
  console.log('🔵 Получены данные:', dayData);

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
          content: `Ты эксперт по календарю Tzolkin. Проанализируй день пользователя и дай краткую рекомендацию (3-4 предложения).

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

    console.log('🔵 Статус от Claude:', response.status);
    const data = await response.json();
    console.log('🔵 Ответ Claude:', data);
    
    const advice = data.content[0].text;
    res.status(200).json({ advice });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
}