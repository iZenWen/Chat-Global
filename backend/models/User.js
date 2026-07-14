const mongoose = require('mongoose');

// Creamos el esquema (el esqueleto) de cómo se verá un usuario
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, // Es obligatorio
    unique: true    // No pueden existir dos usuarios con el mismo nombre
  },
  password: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true // Esto añade automáticamente la fecha de creación (createdAt)
});

// Exportamos el modelo para poder usarlo en otros archivos
module.exports = mongoose.model('User', userSchema);