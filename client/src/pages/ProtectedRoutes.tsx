import { Navigate, Outlet } from 'react-router';

const ProtectedRoute = () => {
   const isAuthenticated:any = localStorage.getItem('user');
  const roleAdmin = JSON.parse(isAuthenticated)
    console.log(roleAdmin?.role)

  return roleAdmin?.role === 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;