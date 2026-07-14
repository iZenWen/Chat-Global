import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // 1. Nuevo estado para el error visual
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos el error previo al intentar de nuevo

    try {
      const response = await fetch('https://chat-global-r0ay.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        navigate('/chat'); 
      } else {
        // 2. En lugar de alert(), guardamos el error en el estado
        setError(data.message); 
      }
    } catch (error) {
      setError('Error de conexión con el servidor. Intenta más tarde.');
    }
  };

  return (
    <div className="container">
      <h2>Iniciar Sesión</h2>
      
      {/* 3. Si hay un error, lo mostramos en pantalla con el diseño CSS nuevo */}
      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nombre de usuario" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
    </div>
  );
}

export default Login;