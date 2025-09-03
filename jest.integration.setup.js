import fs from 'fs'
import path from 'path'

// Setup for integration tests
beforeEach(() => {
  // Clean up test files
  const testConfigPath = path.join(process.cwd(), 'test-config.yaml')
  const testTotpPath = path.join(process.cwd(), 'test-totp-items.json')
  
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath)
  }
  
  if (fs.existsSync(testTotpPath)) {
    fs.unlinkSync(testTotpPath)
  }
})

afterEach(() => {
  // Clean up test files
  const testConfigPath = path.join(process.cwd(), 'test-config.yaml')
  const testTotpPath = path.join(process.cwd(), 'test-totp-items.json')
  
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath)
  }
  
  if (fs.existsSync(testTotpPath)) {
    fs.unlinkSync(testTotpPath)
  }
})
