require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); 
const http = require('http'); // 1. Herramienta nativa de Node para servidores
const { Server } = require('socket.io'); // 2. Importamos Socket.io

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message'); // Traemos el modelo

const app = express();
const PORT = process.env.PORT || 3000;

// 3. Creamos un servidor HTTP que envuelve a nuestra app de Express
const server = http.createServer(app);

// 4. Inicializamos Socket.io sobre ese servidor HTTP
const io = new Server(server, {
  cors: {
    origin: "*", // Permite que tu frontend de React se conecte sin bloqueos
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('¡Conectado a la base de datos MongoDB con éxito! 🥳'))
  .catch((err) => console.error('Error conectando a MongoDB:', err));

// 5. LA MAGIA DE SOCKET.IO: Escuchar conexiones
io.on('connection', (socket) => {
  console.log(`🟢 Nuevo dispositivo conectado. ID: ${socket.id}`);

  // Evento 1: Escuchamos los mensajes que llegan desde el frontend
  socket.on('send_message', async (data) => {
    try {
      // 1. Guardar el mensaje en MongoDB
      const newMessage = new Message({
        sender: data.sender,
        text: data.text
      });
      await newMessage.save();

      // 2. Rebotar el mensaje a TODOS los usuarios
      io.emit('receive_message', data);
      
    } catch (error) {
      console.error("Error guardando el mensaje:", error);
    }
  }); // <--- AQUÍ CERRAMOS SEND_MESSAGE CORRECTAMENTE

  // Evento 2: Escuchamos cuando alguien empieza a escribir
  socket.on('typing', (username) => {
    // Usamos socket.broadcast.emit para avisarle a TODOS los demás, excepto al que escribe
    socket.broadcast.emit('user_typing', username);
  });

  // Evento 3: Escuchamos cuando alguien deja de escribir
  socket.on('stop_typing', () => {
    socket.broadcast.emit('user_stopped_typing');
  });

  // Evento 4: Desconexión
  socket.on('disconnect', () => {
    console.log(`🔴 Dispositivo desconectado. ID: ${socket.id}`);
  });
});

// 6. ¡OJO AQUÍ! Cambiamos app.listen por server.listen
server.listen(PORT, () => {
  console.log(`Servidor de Chat corriendo en http://localhost:${PORT}`);
});