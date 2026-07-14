import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para errores
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // En lugar de alert, podemos redirigir directamente tras el éxito
        alert('¡Registro exitoso! Ahora inicia sesión.'); // Dejamos el de éxito por simplicidad
        navigate('/'); 
      } else {
        setError(data.message); // Mostramos el error visual
      }
    } catch (error) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="container">
      <h2>Crear Cuenta</h2>
      
      {/* Mostramos el error visual si existe */}
      {error && <p className="error-text">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Nuevo usuario" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Nueva contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrarse</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/">Inicia sesión</Link></p>
    </div>
  );
}

export default Register;