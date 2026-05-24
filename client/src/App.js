// v2 mobile fix
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
import PendingApproval from './pages/PendingApproval';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
  user
    ? user.role === 'donor'
      ? <Navigate to="/donor-dashboard" />
      : user.role === 'hospital'
        ? <Navigate to="/hospital-dashboard" />
        : <Navigate to="/" />
    : <Login />
} />
        <Route path="/register" element={user ? <Navigate to={user.role === 'donor' ? '/donor-dashboard' : '/hospital-dashboard'} /> : <Register />} />
        <Route path="/donor-dashboard" element={
          <ProtectedRoute role="donor"><DonorDashboard /></ProtectedRoute>
        } />
        <Route path="/hospital-dashboard" element={
          <ProtectedRoute role="hospital"><HospitalDashboard /></ProtectedRoute>
        } />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
      </Routes>
    </Router>
  );
}

export default App;