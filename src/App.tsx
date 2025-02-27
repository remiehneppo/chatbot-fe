import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './components/Home';
import Chatbot from './components/Chatbot';
import Tasks from './components/Tasks';
import Profile from './components/Profile';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        <Route path="/chatbot" element={
          <MainLayout>
            <Chatbot />
          </MainLayout>
        } />
        <Route path="/tasks" element={
          <MainLayout>
            <Tasks />
          </MainLayout>
        } />
        <Route path="/profile" element={
          <MainLayout>
            <Profile />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
