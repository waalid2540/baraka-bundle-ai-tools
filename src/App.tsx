import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import HomePage from './pages/HomePage'
import DuaGenerator from './pages/DuaGenerator'
import KidsStoryGenerator from './pages/KidsStoryGenerator'
import NamePosterGenerator from './pages/NamePosterGenerator'
import PaymentSuccess from './pages/PaymentSuccess'
import PaymentCancel from './pages/PaymentCancel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dua-generator" element={<DuaGenerator />} />
          <Route path="/kids-stories" element={<KidsStoryGenerator />} />
          <Route path="/kids-story-generator" element={<KidsStoryGenerator />} />
          <Route path="/name-poster" element={<NamePosterGenerator />} />
          <Route path="/name-poster-generator" element={<NamePosterGenerator />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
          
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