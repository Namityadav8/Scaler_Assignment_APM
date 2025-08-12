const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found. Please run this script from the project root.');
  }

  // Install root dependencies
  console.log('📦 Installing root dependencies...');
  execSync('npm ci', { stdio: 'inherit' });

  // Install client dependencies
  console.log('📦 Installing client dependencies...');
  execSync('cd client && npm ci', { stdio: 'inherit' });

  // Build client application
  console.log('🏗️ Building client application...');
  execSync('cd client && npm run build', { stdio: 'inherit' });

  // Verify build output
  const buildPath = path.join(__dirname, 'client', 'build');
  if (fs.existsSync(buildPath)) {
    console.log('✅ Client build completed successfully');
    console.log(`📁 Build output: ${buildPath}`);
    
    // List build contents
    const files = fs.readdirSync(buildPath);
    console.log('📄 Build files:', files);
  } else {
    throw new Error('Build output directory not found');
  }

  console.log('🎉 Build process completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
