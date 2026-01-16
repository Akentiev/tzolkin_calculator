export default async function handler(req, res) {
  console.log('🔵 API вызван');
  console.log('🔵 Есть ключ?', !!process.env.CLAUDE_API_KEY);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dayData, mode } = req.body;
  console.log('🔵 Получены данные:', dayData, 'Режим:', mode);

  try {
    let systemPrompt, maxTokens;

    if (mode === 'structure') {
      // Режим секретаря: упаковка данных в JSON
      maxTokens = 300;
      systemPrompt = `Ты — упаковщик данных. Проанализируй заметки пользователя и верни строгий JSON:
{"ai_summary": "одна фраза-заголовок", "ai_events": ["событие 1", "событие 2"]}

Не используй вводные слова. Будь краток и конкретен.

ДАННЫЕ ДНЯ:
- Тон: ${dayData.tone}
- Печать: ${dayData.seal}
- Энергия: ${dayData.energy}/5
- Резонанс: ${dayData.resonance}
- Стратегия: ${dayData.action}
- Проект: ${dayData.project}
- Событие: ${dayData.insight}
- Заметки: ${dayData.notes || 'отсутствуют'}

Верни ТОЛЬКО JSON, без markdown, без комментариев.`;
    } else {
      // Режим наставника: развернутый анализ
      maxTokens = 800;
      systemPrompt = `Ты — коуч по Цолькину. Дай глубокий психологический разбор дня на основе Кина, Энергии и заметок пользователя.

Используй Markdown: заголовки, жирный текст и списки. Избегай эзотерического шума.
Тон: деловой, поддерживающий, психологический.
Переводи символизм в конкретные действия.
Не используй эмодзи/пиктограммы/иконки.

ДАННЫЕ ДНЯ:
- Тон: ${dayData.tone}
- Печать: ${dayData.seal}
- Энергия: ${dayData.energy}/5
- Резонанс: ${dayData.resonance}
- Стратегия: ${dayData.action} (Делать/Быть)
- Проект: ${dayData.project}
- Событие: ${dayData.insight}
- Заметки: ${dayData.notes || 'отсутствуют'}

СТРУКТУРА:
### Вектор дня: [Печать и тон]
[Суть дня — 1 предложение]

### Анализ ситуации
[Связь события/проекта с энергией дня]

### Практические рекомендации
* **Фокус:** (на чем сосредоточиться)
* **Действие:** (конкретный шаг)
* **Внимание:** (эмоциональный аспект)

### Вопрос для рефлексии
[Коучинговый вопрос]`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        temperature: mode === 'structure' ? 0.3 : 0.5,
        messages: [{
          role: 'user',
          content: systemPrompt
        }]
      })
    });

    console.log('🔵 Статус от Claude:', response.status);
    const data = await response.json();
    console.log('🔵 Ответ Claude:', data);

    const result = data.content[0].text;

    if (mode === 'structure') {
      // Парсим JSON и возвращаем структурированные данные
      try {
        const parsed = JSON.parse(result);
        res.status(200).json({
          ai_summary: parsed.ai_summary || '',
          ai_events: parsed.ai_events || []
        });
      } catch (e) {
        console.error('❌ Ошибка парсинга JSON:', e);
        res.status(200).json({
          ai_summary: result.substring(0, 200),
          ai_events: []
        });
      }
    } else {
      // Возвращаем Markdown как есть
      res.status(200).json({ advice: result });
    }

  } catch (error) {
    console.error('❌ Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
}