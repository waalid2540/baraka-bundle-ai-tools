import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const products = [
    {
      id: 1,
      title: "Duʿā Generator",
      description: "Create personalized duʿā PDFs in 8+ languages",
      price: "$2.99",
      icon: "🤲",
      gradient: "from-emerald-500 to-teal-500",
      link: "/dua-generator",
      features: ["Arabic + Translation", "Beautiful PDF Export", "Islamic Borders", "8 Languages"]
    },
    {
      id: 2, 
      title: "Kids' Islamic Stories",
      description: "Bedtime Islamic stories for children",
      price: "$2.99",
      icon: "📚",
      gradient: "from-purple-500 to-pink-500",
      link: "/kids-stories",
      features: ["Age-Appropriate", "Moral Lessons", "Multiple Themes", "PDF Downloads"]
    },
    {
      id: 3,
      title: "Name Poster Generator", 
      description: "Beautiful name posters with meanings",
      price: "$3.99",
      icon: "🎨",
      gradient: "from-amber-500 to-orange-500",
      link: "/name-poster",
      features: ["Arabic Calligraphy", "Name Meanings", "Quranic References", "Premium Design"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Premium Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-yellow-500/20">
                <span className="text-3xl">✨</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  BarakahTool
                </h1>
                <p className="text-yellow-300/80 text-sm font-medium">Premium Islamic Digital SaaS</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-medium">GPT-5 Powered</span>
              </div>
              
              <button className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold hover:from-yellow-600 hover:to-amber-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/30 transform hover:-translate-y-0.5">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <span className="inline-block px-6 py-2 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-500/30 backdrop-blur-md">
                🏆 HIGH-CLASS ISLAMIC DIGITAL TOOLS
              </span>
            </div>
            
            <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-tight">
              Premium
              <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
                Islamic AI Platform
              </span>
            </h1>
            
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Powered by <span className="text-yellow-400 font-bold">GPT-5 Technology</span>. 
              Generate unlimited authentic Islamic content in <span className="text-yellow-400 font-bold">8+ languages</span>.
              Professional PDFs with Arabic calligraphy and Islamic designs.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                <span className="text-yellow-400 font-bold">✅ One-Time Payment</span>
              </div>
              <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                <span className="text-yellow-400 font-bold">✅ Instant PDF Downloads</span>
              </div>
              <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                <span className="text-yellow-400 font-bold">✅ 8+ Languages</span>
              </div>
              <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10">
                <span className="text-yellow-400 font-bold">✅ Unlimited Generation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Our Premium Products
            </h2>
            <p className="text-xl text-gray-400">
              High-quality Islamic digital tools at affordable prices
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product) => (
              <Link 
                key={product.id}
                to={product.link}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"
                     style={{
                       backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                       '--tw-gradient-from': product.gradient.split(' ')[1],
                       '--tw-gradient-to': product.gradient.split(' ')[3],
                     }}>
                </div>
                
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 hover:border-yellow-500/50 transition-all duration-500 hover:transform hover:-translate-y-2">
                  <div className={`w-20 h-20 bg-gradient-to-r ${product.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl`}>
                    <span className="text-4xl">{product.icon}</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {product.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-6">
                    {product.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="text-yellow-400">✓</span>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-yellow-400">
                      {product.price}
                    </span>
                    <span className={`px-4 py-2 bg-gradient-to-r ${product.gradient} text-white rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300`}>
                      Get Started →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">100K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">8+</div>
              <div className="text-gray-400">Languages</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">GPT-5</div>
              <div className="text-gray-400">AI Technology</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">99.9%</div>
              <div className="text-gray-400">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/40 backdrop-blur-xl border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-3xl">✨</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                BarakahTool
              </span>
            </div>
            <p className="text-gray-400 mb-4">
              Premium Islamic Digital SaaS Platform
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 BarakahTool. All rights reserved. | Powered by GPT-5
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage