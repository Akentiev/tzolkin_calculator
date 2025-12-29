export default async function handler(req, res) {
  try {
    const { message } = req.body || {};
    
    if (message?.text === '/start') {
      const chatId = message.chat.id;
      
      await fetch(`https://api.telegram.org/bot8140786228:AAEVndmITKCv7GtosJIa4KNYr1wyYETQ8co/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: 'Привет! Я бот 👋'
        })
      });
    }
    
    return res.status(200).json({ ok: true });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
}