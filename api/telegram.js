export default async function handler(req, res) {
  const { message } = req.body;
  
  // Проверка команды /start
  if (message?.text === '/start') {
    const chatId = message.chat.id;
    
    // Ответ пользователю
    await fetch(`https://api.telegram.org/bot${process.env.8140786228:AAEVndmITKCv7GtosJIa4KNYr1wyYETQ8co}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: 'Привет! Я бот 👋'
      })
    });
  }
  
  res.status(200).json({ ok: true });
}
```
