// Test environment variable loading
require('dotenv').config()
require('dotenv').config({ path: '../.env' })

console.log('Testing environment variables:')
console.log('=====================================')
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
console.log('REACT_APP_OPENAI_API_KEY exists:', !!process.env.REACT_APP_OPENAI_API_KEY)

if (process.env.OPENAI_API_KEY) {
  const key = process.env.OPENAI_API_KEY
  console.log('OPENAI_API_KEY format:', key.substring(0, 10) + '...' + key.substring(key.length - 4))
}

console.log('\nAll OPENAI env vars:')
Object.keys(process.env)
  .filter(k => k.includes('OPENAI'))
  .forEach(k => console.log(`  ${k}: ${process.env[k].substring(0, 20)}...`))

console.log('\nWorking directory:', process.cwd())
console.log('Parent .env exists:', require('fs').existsSync('../.env'))
console.log('Current .env exists:', require('fs').existsSync('./.env'))