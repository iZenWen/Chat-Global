const express = require('express');
const Message = require('../models/Message'); // Traemos el molde del mensaje
const router = express.Router();

// Ruta para obtener el historial (GET)
router.get('/history', async (req, res) => {
  try {
    // Busca mensajes, los ordena del más viejo al más nuevo y trae solo los últimos 50
    const messages = await Message.find().sort({ createdAt: 1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial', error });
  }
});

module.exports = router;