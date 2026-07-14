import { useState, useEffect, useRef } from 'react'; // 1. Importamos useRef
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('https://chat-global-r0ay.onrender.com');

function Chat() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Usuario';

  const [currentMessage, setCurrentMessage] = useState('');
  const [messageList, setMessageList] = useState([]);

  // 2. NUEVO: Creamos un "ancla" invisible al final del chat
  const messagesEndRef = useRef(null);

  // 3. NUEVO: Cada vez que la lista de mensajes cambie, bajamos el scroll automáticamente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messageList]);

  // Historial
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

  // Escuchar mensajes en vivo
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on('receive_message', handleReceiveMessage);
    
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (currentMessage.trim() !== '') {
      const messageData = {
        sender: username,
        text: currentMessage,
      };

      socket.emit('send_message', messageData);
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
        {/* 4. NUEVO: Ponemos el "ancla" invisible justo al final de los mensajes */}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={sendMessage}>
        <input 
          type="text" 
          placeholder="Escribe un mensaje aquí..." 
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)} 
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Chat;