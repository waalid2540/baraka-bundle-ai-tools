import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Professional Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌟</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Baraka Bundle</h1>
                <p className="text-emerald-300 text-sm">AI Tools for the Ummah</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-6">
                <span className="text-white/80 text-sm">1.2B+ Muslims Worldwide</span>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-green-400 text-sm font-medium">Live</span>
                </div>
              </div>
              
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                Get Access - $5.99
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800/20 to-cyan-800/20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30">
                ✨ Trusted by 50K+ Muslims Worldwide
              </span>
            </div>
            
            <h2 className="text-7xl font-bold text-white mb-6 leading-tight">
              Professional
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> Islamic AI</span>
              <br />Tools Platform
            </h2>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              4 powerful AI tools rooted in Qur'an and Sunnah. Used by families, educators, and Islamic organizations worldwide. 
              <span className="text-emerald-400 font-semibold">Authentic, smart, and beneficial.</span>
            </p>

            {/* Pricing Card */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-8 max-w-md mx-auto mb-12">
              <div className="text-center">
                <div className="text-white/60 text-sm mb-2">One-time purchase</div>
                <div className="text-5xl font-bold text-white mb-2">$5.99</div>
                <div className="text-emerald-400 text-sm font-medium mb-4">Lifetime access to all 4 tools</div>
                <div className="text-white/60 text-xs">
                  ✅ No subscriptions • ✅ No hidden fees • ✅ 50% supports Masjid
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/25 transform hover:-translate-y-1">
                🚀 Get Baraka Bundle Now
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                🎬 Watch Demo
              </button>
            </div>
          </div>
        </div>
      </main>

        {/* Professional Tools Section */}
        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-white mb-4">
                4 Powerful AI Tools
              </h3>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Professional Islamic AI tools trusted by families, educators, and Islamic organizations worldwide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Du'a Generator */}
              <Link to="/dua-generator" className="group relative">
                <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 transform hover:-translate-y-2">
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🧠
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-1">AI Du'ā Generator</h4>
                      <p className="text-emerald-400 text-sm">Authentic Islamic Supplications</p>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Generate heartfelt du'ā in seconds from authentic Qur'anic and Prophetic sources. 
                    Perfect for daily prayers and special occasions.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span className="text-white/70">10+ Categories</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span className="text-white/70">Arabic + Translation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span className="text-white/70">Proper Citations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      <span className="text-white/70">4 Languages</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <span className="text-emerald-400 font-semibold group-hover:text-emerald-300 transition-colors">
                      Try Du'ā Generator →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Kids Story Generator */}
              <Link to="/kids-story-generator" className="group relative">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 transform hover:-translate-y-2">
                  <div className="absolute top-4 right-4">
                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-medium">
                      Family Favorite
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      📖
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-1">Islamic Kids Stories</h4>
                      <p className="text-purple-400 text-sm">Educational & Entertaining</p>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Create meaningful stories for Muslim children with Qur'anic moral lessons. 
                    Perfect for bedtime, education, and family bonding.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-white/70">Ages 3-13</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-white/70">Qur'anic Lessons</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-white/70">Custom Names</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-white/70">Print & Share</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <span className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
                      Create Stories →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Tafsir Generator */}
              <Link to="/tafsir-generator" className="group relative">
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 backdrop-blur-md border border-blue-500/20 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 transform hover:-translate-y-2">
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-medium">
                      Scholar's Choice
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      📚
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-1">Tafsir Generator</h4>
                      <p className="text-blue-400 text-sm">Authentic Classical Sources</p>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Understand the Qur'an deeply using authentic tafsir from Ibn Kathir, As-Sa'di, 
                    and Tabari. Perfect for da'wah and education.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-white/70">Classical Sources</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-white/70">Verse Search</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-white/70">Historical Context</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-white/70">Practical Application</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <span className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">
                      Explore Tafsir →
                    </span>
                  </div>
                </div>
              </Link>

              {/* Name Generator */}
              <Link to="/name-generator" className="group relative">
                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 transform hover:-translate-y-2">
                  <div className="absolute top-4 right-4">
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-medium">
                      Parent's Pick
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      ✨
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-1">Islamic Names</h4>
                      <p className="text-amber-400 text-sm">Meaningful & Beautiful</p>
                    </div>
                  </div>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Generate beautiful Islamic names with meanings, pronunciation, and historical significance. 
                    Perfect for babies, businesses, or brands.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span className="text-white/70">Male & Female</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span className="text-white/70">Arabic Script</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span className="text-white/70">Islamic History</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span className="text-white/70">Download Lists</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <span className="text-amber-400 font-semibold group-hover:text-amber-300 transition-colors">
                      Find Names →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Professional CTA Section */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-cyan-600 py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium">
                🎯 Limited Time Offer
              </span>
            </div>
            
            <h3 className="text-5xl font-bold text-white mb-6">
              Join 50,000+ Muslims Using
              <br />
              Professional Islamic AI Tools
            </h3>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Get lifetime access to all 4 AI tools for just $5.99. 
              No subscriptions, no hidden fees. 50% of proceeds support Islamic education.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:-translate-y-1">
                🚀 Get Baraka Bundle Now - $5.99
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300">
                📱 Try Free Demo
              </button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-white/80 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Instant Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>30-Day Guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Support Islamic Education</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof Section */}
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h4 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Muslims Worldwide
              </h4>
              <p className="text-gray-600">
                From families to Islamic organizations, Baraka Bundle is making an impact
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">50,000+</div>
                <div className="text-gray-700 font-medium">Active Users</div>
                <div className="text-sm text-gray-500 mt-2">Across 45 countries</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">1.2M+</div>
                <div className="text-gray-700 font-medium">AI Generations</div>
                <div className="text-sm text-gray-500 mt-2">Du'as, Stories, Names & Tafsir</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
                <div className="text-gray-700 font-medium">User Rating</div>
                <div className="text-sm text-gray-500 mt-2">Based on 5,000+ reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Footer */}
        <footer className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🌟</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold">Baraka Bundle</h5>
                    <p className="text-emerald-400 text-sm">AI Tools for the Ummah</p>
                  </div>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  Professional Islamic AI tools serving 1.2 billion Muslims worldwide. 
                  Authentic, beneficial, and rooted in Qur'an and Sunnah.
                </p>
                <div className="flex space-x-4">
                  <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    📧
                  </button>
                  <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    🐦
                  </button>
                  <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                    📱
                  </button>
                </div>
              </div>
              
              <div>
                <h6 className="font-semibold mb-4">AI Tools</h6>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/dua-generator" className="hover:text-white transition-colors">Du'a Generator</Link></li>
                  <li><Link to="/kids-story-generator" className="hover:text-white transition-colors">Kids Stories</Link></li>
                  <li><Link to="/tafsir-generator" className="hover:text-white transition-colors">Tafsir Generator</Link></li>
                  <li><Link to="/name-generator" className="hover:text-white transition-colors">Name Generator</Link></li>
                </ul>
              </div>
              
              <div>
                <h6 className="font-semibold mb-4">Support</h6>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Islamic Guidelines</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-12 pt-8 text-center">
              <p className="text-gray-400 text-sm mb-2">
                © 2024 Baraka Bundle. All rights reserved.
              </p>
              <p className="text-emerald-400 text-sm font-medium">
                "May Allah bless this project and make it beneficial for the Ummah worldwide"
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default HomePage