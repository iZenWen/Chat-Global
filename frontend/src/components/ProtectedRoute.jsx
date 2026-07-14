import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Intentamos obtener el token que guardamos en el Login
  const token = localStorage.getItem('token');

  // Si NO hay token, lo mandamos al Login (ruta "/")
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si SÍ hay token, lo dejamos ver la pantalla que quería (el Chat)
  return children;
}

export default ProtectedRoute;