import { Navigate } from 'react-router-dom';

interface UserProtectedRouteProps {
  children: React.ReactNode;
}

const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
  const userToken = localStorage.getItem('user_token');

  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;