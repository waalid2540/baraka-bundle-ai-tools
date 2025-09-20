import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DuaGenerator from './pages/DuaGenerator'
import KidsStoryGenerator from './pages/KidsStoryGenerator'
import NamePosterGenerator from './pages/NamePosterGenerator'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'
import DalleDebug from './components/DalleDebug'
import FeatureRedirect from './components/FeatureRedirect'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          <Route path="/dalle-debug" element={<DalleDebug />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="/old-dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Feature Routes - Redirect to login/dashboard */}
          <Route path="/dua-generator" element={<FeatureRedirect />} />
          <Route path="/kids-stories" element={<FeatureRedirect />} />
          <Route path="/kids-story-generator" element={<FeatureRedirect />} />
          <Route path="/name-poster" element={<FeatureRedirect />} />
          <Route path="/name-poster-generator" element={<FeatureRedirect />} />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
                <a href="/" className="text-islamic-green-600 hover:underline">
                  Return to BarakahTool
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App