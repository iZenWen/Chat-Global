import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('https://chat-global-r0ay.onrender.com');

function Chat() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Usuario';

  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  
  // NUEVO: Estado para saber quién está escribiendo
  const [typingUser, setTypingUser] = useState(''); 
  const messagesEndRef = useRef(null);
  
  // NUEVO: Referencia para controlar el cronómetro
  const typingTimeoutRef = useRef(null); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList, typingUser]); // Añadimos typingUser para que baje el scroll si aparece el aviso

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('https://chat-global-r0ay.onrender.com/api/messages/history');
        const data = await response.json();
        
        if (response.ok) {
          setMessageList(data);
        }
      } catch (error) {
        console.error('Error cargando el historial:', error);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
      setTypingUser(''); // Si recibimos un mensaje, quitamos el "escribiendo..."
    };

    // NUEVO: Escuchamos los avisos de escritura
    const handleTyping = (user) => setTypingUser(user);
    const handleStopTyping = () => setTypingUser('');

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  // NUEVO: Función inteligente para cuando tecleamos
  const handleInputChange = (e) => {
    setCurrentMessage(e.target.value);

    // Avisamos que estamos escribiendo
    socket.emit('typing', username);

    // Borramos el cronómetro anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Creamos un nuevo cronómetro de 2 segundos
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing');
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (currentMessage.trim() !== '') {
      const messageData = {
        sender: username,
        text: currentMessage,
      };

      socket.emit('send_message', messageData);
      socket.emit('stop_typing'); // Al enviar, dejamos de escribir instantáneamente
      setCurrentMessage('');
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h3>💬 Chat Global</h3>
        <div className="user-info">
          <span>Hola, <strong>{username}</strong></span>
          <button onClick={handleLogout} className="logout-btn">Salir</button>
        </div>
      </header>

      <div className="chat-messages">
        {messageList.map((msg, index) => {
          const isMine = msg.sender === username;
          
          return (
            <div key={index} className={`message ${isMine ? 'mine' : 'other'}`}>
              <span className="sender">{msg.sender}</span>
              <p className="text">{msg.text}</p>
            </div>
          );
        })}
        
        {/* NUEVO: El indicador visual de que alguien escribe */}
        {typingUser && (
          <div className="message other typing-indicator">
            <p className="text"><em>{typingUser} está escribiendo...</em> ✍️</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Escribe un mensaje aquí..." 
          value={currentMessage}
          onChange={handleInputChange} // Conectamos el input a nuestra nueva función
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Chat;