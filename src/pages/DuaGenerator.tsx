import React from 'react'
import { Link } from 'react-router-dom'

const DuaGenerator = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-islamic-gold-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-islamic-green-600 hover:text-islamic-green-800">
              ← Back to Baraka Bundle
            </Link>
            <h1 className="text-2xl font-bold text-islamic-green-800">
              🧠 AI Du'ā Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Authentic Du'ā
          </h2>
          <p className="text-lg text-gray-600">
            Create heartfelt du'ā based on authentic Qur'anic and Prophetic sources
          </p>
        </div>

        <div className="card max-w-2xl mx-auto">
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🚧</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon!
            </h3>
            <p className="text-gray-600 mb-6">
              The AI Du'ā Generator is being built with OpenAI integration.
              It will feature authentic Islamic du'ā with proper citations.
            </p>
            <Link to="/" className="btn-primary">
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DuaGenerator