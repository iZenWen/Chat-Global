const mongoose = require('mongoose');

// Creamos el esquema de un mensaje
const messageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    required: true // Necesitamos saber quién lo envió
  },
  text: { 
    type: String, 
    required: true // El contenido del mensaje en sí
  }
}, { 
  timestamps: true // Muy importante para ordenar los mensajes del más viejo al más nuevo
});

module.exports = mongoose.model('Message', messageSchema);