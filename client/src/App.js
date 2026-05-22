import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/DonorDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyOTP from './pages/VerifyOTP';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'} /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'} /> : <Register />} />
        <Route path="/donor-dashboard" element={
          <ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>
        } />
        <Route path="/hospital-dashboard" element={
          <ProtectedRoute role="hospital"><HospitalDashboard /></ProtectedRoute>
        } />
        <Route path="/verify-otp" element={<VerifyOTP />} />
      </Routes>
    </Router>
  );
}

export default App;