import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import UserProtectedRoute from './components/UserProtectedRoute';
import Home from './components/Home';
import Chatbot from './components/Chatbot';
import Tasks from './components/Tasks';
import Profile from './components/Profile';
import DocumentSearch from './components/DocumentSearch';
import './App.css';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import DocumentManagement from './components/admin/DocumentManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        <Route path="/login" element={
          <MainLayout>
            <Login />
          </MainLayout>
        } />

        {/* Protected user routes */}
        <Route path="/chatbot" element={
          <UserProtectedRoute>
            <MainLayout>
              <Chatbot />
            </MainLayout>
          </UserProtectedRoute>
        } />
        <Route path="/tasks" element={
          <UserProtectedRoute>
            <MainLayout>
              <Tasks />
            </MainLayout>
          </UserProtectedRoute>
        } />
        <Route path="/profile" element={
          <UserProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </UserProtectedRoute>
        } />
        <Route path="/document-search" element={
          <UserProtectedRoute>
          <MainLayout>
            <DocumentSearch />
          </MainLayout>
          </UserProtectedRoute>
        } />
        <Route path="/admin/login" element={
          <AdminLogin />
        } />

        {/* Protected admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DocumentManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
