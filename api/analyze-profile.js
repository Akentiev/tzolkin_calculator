export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { birthDate, kin, tone, seal, consciousness, mission } = req.body;

    try {
        const systemPrompt = `Ты — эксперт по синтезу Цолькин (майянский календарь) и Сюцай (китайская нумерология).

Создай краткий психологический портрет личности на основе данных:

**Tzolk'in:**
- Кин: ${kin}
- Тон: ${tone}
- Печать: ${seal}

**Сюцай:**
- Число Сознания: ${consciousness}
- Число Миссии: ${mission}

**Дата рождения:** ${birthDate}

ТРЕБОВАНИЯ:
- Объём: 3-5 предложений
- Тон: деловой, глубокий, без мистики
- Найди синергию между Цолькин и Сюцай
- Фокус: сильные стороны, вызовы, рекомендации
- Не используй эмодзи/пиктограммы
- Пиши от 2-го лица ("Вы", "Ваш")

Пример структуры:
"Вы обладаете [ключевое качество из печати + число сознания]. Ваша миссия [число миссии] усиливается энергией [тон], что даёт [практический вывод]. Рекомендация: [конкретное действие]."`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 300,
                temperature: 0.6,
                messages: [{
                    role: 'user',
                    content: systemPrompt
                }]
            })
        });

        const data = await response.json();
        const portrait = data.content[0].text;

        res.status(200).json({ portrait });
    } catch (error) {
        console.error('Ошибка генерации портрета:', error);
        res.status(500).json({ error: 'Ошибка генерации портрета' });
    }
}
