import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-islamic-green-50 via-white to-islamic-gold-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center">
            <h1 className="text-4xl font-bold text-islamic-green-800">
              🌟 Baraka Bundle
            </h1>
          </div>
          <p className="text-center text-islamic-green-600 mt-2 text-lg">
            AI Tools for the Ummah - Professional Islamic AI Platform
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Authentic Islamic AI Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Professional, authentic, and AI-powered tools rooted in Qur'an and Sunnah. 
            Simple, smart, and beneficial for families, educators, and seekers of knowledge.
          </p>
          <div className="bg-islamic-gold-100 border border-islamic-gold-300 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-islamic-gold-800 font-semibold">
              🎯 One-time purchase: $5.99 | Lifetime access to all tools
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {/* Du'a Generator */}
          <Link to="/dua-generator" className="tool-card group">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Du'ā Generator</h3>
              <p className="text-gray-600 mb-4">
                Create heartfelt du'ā in seconds, based on authentic Qur'anic and Prophetic sources.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✅ Categories: sadness, success, parenting, travel</li>
                <li>✅ Arabic + English with proper citations</li>
                <li>✅ Multi-language support</li>
                <li>✅ Voice narration option</li>
              </ul>
            </div>
          </Link>

          {/* Kids Story Generator */}
          <Link to="/kids-story-generator" className="tool-card group">
            <div className="text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Islamic Kids Stories</h3>
              <p className="text-gray-600 mb-4">
                Generate meaningful stories for Muslim children that teach morals from Islam.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✅ Ages 3-13 with customizable themes</li>
                <li>✅ Qur'anic moral lessons included</li>
                <li>✅ Voice narration for bedtime</li>
                <li>✅ Perfect for educational content</li>
              </ul>
            </div>
          </Link>

          {/* Tafsir Generator */}
          <Link to="/tafsir-generator" className="tool-card group">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tafsir Generator</h3>
              <p className="text-gray-600 mb-4">
                Understand the Qur'an deeply using authentic tafsir sources.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✅ Ibn Kathir, As-Sa'di, Tabari sources</li>
                <li>✅ Arabic text + English summary</li>
                <li>✅ Search by Surah/Ayah or keyword</li>
                <li>✅ Perfect for da'wah and education</li>
              </ul>
            </div>
          </Link>

          {/* Name Generator */}
          <Link to="/name-generator" className="tool-card group">
            <div className="text-center">
              <div className="text-6xl mb-4">🧾</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Islamic Names</h3>
              <p className="text-gray-600 mb-4">
                Beautiful and meaningful names for babies, businesses, or brands.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✅ Gender-specific options</li>
                <li>✅ Arabic, Somali, Urdu languages</li>
                <li>✅ Islamic history and significance</li>
                <li>✅ Downloadable lists</li>
              </ul>
            </div>
          </Link>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-islamic-green-600 text-white rounded-2xl p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-islamic-green-100 mb-6">
            Join thousands of Muslims using authentic AI tools for spiritual growth
          </p>
          <button className="bg-white text-islamic-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-islamic-green-50 transition-colors">
            🚀 Get Baraka Bundle - $5.99
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">🌟 Baraka Bundle – AI Tools for the Ummah</p>
          <p className="text-gray-400">
            "May Allah bless this project and make it beneficial for the Ummah worldwide"
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage