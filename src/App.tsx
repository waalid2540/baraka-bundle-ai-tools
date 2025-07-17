import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DuaGenerator from './pages/DuaGenerator'
import KidsStoryGenerator from './pages/KidsStoryGenerator'
import TafsirGenerator from './pages/TafsirGenerator'
import NameGenerator from './pages/NameGenerator'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dua-generator" element={<DuaGenerator />} />
        <Route path="/kids-story-generator" element={<KidsStoryGenerator />} />
        <Route path="/tafsir-generator" element={<TafsirGenerator />} />
        <Route path="/name-generator" element={<NameGenerator />} />
        
        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
              <a href="/" className="text-islamic-green-600 hover:underline">
                Return to Baraka Bundle
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  )
}

export default App