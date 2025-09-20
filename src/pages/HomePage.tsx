import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import MobileMenu from '../components/MobileMenu'

const HomePage = () => {
  const { user, isAdmin } = useAuth()
  const products = [
    {
      id: 1,
      title: "Duʿā Generator",
      description: "Instant personalized Islamic prayers with perfect Arabic",
      price: "$2.99",
      icon: "🤲",
      gradient: "from-emerald-500 to-teal-500",
      link: "/dua-generator",
      features: ["Perfect Arabic + Tashkeel", "16+ Language Translations", "Quranic References", "Instant PDF Download"]
    },
    {
      id: 2,
      title: "Kids' Islamic Stories",
      description: "Captivating Islamic tales that teach perfect values",
      price: "$2.99",
      icon: "📚",
      gradient: "from-purple-500 to-pink-500",
      link: "/kids-stories",
      features: ["Authentic Islamic Lessons", "Age-Perfect Content", "Engaging Narratives", "Parent Discussion Guide"]
    },
    {
      id: 3,
      title: "Name Poster Generator",
      description: "Stunning Islamic name art with deep spiritual meaning",
      price: "$3.99",
      icon: "🎨",
      gradient: "from-amber-500 to-orange-500",
      link: "/name-poster",
      features: ["Master Calligraphy", "Deep Islamic History", "Spiritual Significance", "Museum-Quality Design"]
    },
    {
      id: 4,
      title: "Islamic eBook Generator",
      description: "Professional eBooks with AI content, templates & multi-format export",
      price: "$4.99",
      icon: "📚",
      gradient: "from-indigo-500 to-purple-600",
      link: "/ebook-generator",
      features: ["Professional Templates", "AI Content Generation", "DALL-E Illustrations", "Multi-Format Export"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Premium Header - Mobile Responsive */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Section - Responsive */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
                <span className="text-2xl sm:text-3xl">✨</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  BarakahTool
                </h1>
                <p className="text-yellow-300/80 text-xs sm:text-sm font-medium hidden sm:block">Premium Islamic Digital SaaS</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">AI Powered</span>
              </div>

              {/* Desktop Links */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-yellow-300 hover:text-yellow-200 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                      Dashboard
                    </Link>
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        className="text-purple-300 hover:text-purple-200 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                      >
                        Admin
                      </Link>
                    )}
                    <span className="text-gray-400">|</span>
                    <span className="text-yellow-300 text-sm">
                      {user.name}
                    </span>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-yellow-300 hover:text-yellow-200 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 transform hover:-translate-y-0.5"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu */}
            <MobileMenu isDark={true} />
          </div>
        </div>
      </header>

      {/* Hero Section - Mobile Responsive */}
      <section className="relative overflow-hidden px-4 py-12 sm:py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-gradient-radial from-yellow-500/10 via-transparent to-transparent animate-spin-slow"></div>
          <div className="absolute -bottom-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-radial from-amber-500/10 via-transparent to-transparent animate-spin-slow animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {/* Hero Content - Responsive Text */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 px-4 py-2 rounded-full mb-6 sm:mb-8 backdrop-blur-xl">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
              <span className="text-yellow-300 text-xs sm:text-sm font-medium">NEW: Advanced AI Models Now Live</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8">
              <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Islamic AI Tools
              </span>
              <br />
              <span className="text-white text-3xl sm:text-4xl md:text-6xl">That Transform Lives</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              Experience the perfect fusion of authentic Islamic knowledge and cutting-edge AI.
              Every tool crafted with spiritual precision and technological excellence.
            </p>

            {/* CTA Buttons - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 transform hover:-translate-y-1 flex items-center justify-center space-x-3"
              >
                <span>Start Creating Now</span>
                <span className="text-2xl">→</span>
              </Link>

              <Link
                to="/demo"
                className="w-full sm:w-auto border-2 border-yellow-500/30 text-yellow-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all duration-300 backdrop-blur-xl flex items-center justify-center space-x-3"
              >
                <span>Watch Demo</span>
                <span className="text-xl">▶️</span>
              </Link>
            </div>
          </div>

          {/* Trust Indicators - Mobile Responsive */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-20">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">50K+</div>
              <div className="text-xs sm:text-sm text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">1M+</div>
              <div className="text-xs sm:text-sm text-gray-400">Duas Generated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">4.9★</div>
              <div className="text-xs sm:text-sm text-gray-400">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-300">24/7</div>
              <div className="text-xs sm:text-sm text-gray-400">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid - Mobile Responsive */}
      <section className="px-4 py-12 sm:py-20 bg-black/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
              Premium Islamic Tools
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">One-time payment. Lifetime access. Unlimited usage.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:transform hover:scale-105 backdrop-blur-xl group"
              >
                <div className="p-6 sm:p-8">
                  {/* Product Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${product.gradient} rounded-xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl`}>
                      {product.icon}
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1 rounded-full">
                      <span className="text-yellow-300 font-bold text-lg sm:text-xl">{product.price}</span>
                    </div>
                  </div>

                  {/* Product Content */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{product.title}</h3>
                  <p className="text-gray-400 mb-6 text-sm sm:text-base">{product.description}</p>

                  {/* Features */}
                  <ul className="space-y-2 sm:space-y-3 mb-6">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-300 text-sm sm:text-base">
                        <span className="text-green-400 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to={user ? "/dashboard" : "/login"}
                    className={`w-full bg-gradient-to-r ${product.gradient} text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 group-hover:shadow-yellow-500/20 flex items-center justify-center space-x-2`}
                  >
                    <span>{user ? "Go to Dashboard" : "Sign In to Access"}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Mobile Responsive */}
      <footer className="bg-black/60 border-t border-yellow-500/20 px-4 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <div className="text-yellow-300 font-bold text-lg sm:text-xl mb-2">BarakahTool</div>
              <div className="text-gray-400 text-xs sm:text-sm">© 2024 All rights reserved</div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link to="/privacy" className="text-gray-400 hover:text-yellow-300 text-sm">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-yellow-300 text-sm">Terms</Link>
              <Link to="/contact" className="text-gray-400 hover:text-yellow-300 text-sm">Contact</Link>
              <Link to="/support" className="text-gray-400 hover:text-yellow-300 text-sm">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage