#!/usr/bin/env node

/**
 * Demo Data Loader for ClaimsSense
 * 
 * This script loads sample claims data for demonstration purposes.
 * Run this after setting up the application to populate it with test data.
 */

import { initializeSampleData } from './src/utils/sampleData.js'

async function main() {
  console.log('🚀 ClaimsSense Demo Data Loader')
  console.log('================================')
  
  try {
    console.log('📊 Loading sample data...')
    await initializeSampleData()
    console.log('✅ Sample data loaded successfully!')
    console.log('')
    console.log('You can now:')
    console.log('• Login with username: admin, password: admin123')
    console.log('• View sample claims in the Critical Errors queue')
    console.log('• Test the review workflow')
    console.log('• Explore the analytics dashboard')
    console.log('')
    console.log('Happy testing! 🎉')
  } catch (error) {
    console.error('❌ Failed to load sample data:', error)
    process.exit(1)
  }
}

main()

