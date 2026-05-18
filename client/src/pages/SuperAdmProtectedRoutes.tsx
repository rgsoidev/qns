import { Navigate, Outlet } from 'react-router';

const SuperAdmProtectedRoutes = () => {

  const isAuthenticated:any = localStorage.getItem('user');
  const roleAdmin = JSON.parse(isAuthenticated)
    console.log(roleAdmin)

  return roleAdmin?.role === 'super admin' ? <Outlet /> : <Navigate to="/admin" replace />;
};

export default SuperAdmProtectedRoutes;