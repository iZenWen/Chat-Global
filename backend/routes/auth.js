const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Traemos el molde del usuario

const router = express.Router();

// 1. RUTA DE REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario y guardarlo
    const newUser = new User({
      username,
      password: hashedPassword
    });
    await newUser.save();

    res.status(201).json({ message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

// 2. RUTA DE LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar si el usuario existe en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña escrita con la encriptada
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Crear el Pase VIP (Token JWT)
    const token = jwt.sign({ id: user._id }, 'CLAVE_SECRETA_SUPER_SEGURA', { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
});

module.exports = router;