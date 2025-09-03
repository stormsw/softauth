import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/login'
import fs from 'fs'
import path from 'path'
import { parse, stringify } from 'yaml'

describe('/api/login', () => {
  const testConfigPath = path.join(process.cwd(), 'test-config.yaml')
  
  beforeEach(() => {
    // Create test config
    const testConfig = {
      admin: {
        username: 'testuser',
        salt: 'testsalt',
        // Hash for password 'testpass' with salt 'testsalt'
        password: 'a6b8c8f3d7a2c9e1f4b5d8a7c6e9f2b3d4e7f8a9b2c5d8e1f4a7b0c3d6e9f2b5d8a1c4e7f0a3b6c9d2e5f8b1c4d7e0a3b6c9d2e5f8b1c4d7e0a3b6c9d2'
      }
    }
    fs.writeFileSync(testConfigPath, stringify(testConfig))
    
    // Mock the config path in the handler
    jest.doMock('fs', () => ({
      ...jest.requireActual('fs'),
      readFileSync: jest.fn((filePath: string, encoding: string) => {
        if (filePath.includes('config.yaml')) {
          return fs.readFileSync(testConfigPath, encoding)
        }
        return jest.requireActual('fs').readFileSync(filePath, encoding)
      })
    }))
  })

  afterEach(() => {
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath)
    }
    jest.clearAllMocks()
  })

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(res._getData()).toBe('Method Not Allowed')
  })

  it('should return 401 for invalid username', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'wronguser',
        password: 'testpass'
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid credentials'
    })
  })

  it('should return 401 for invalid password', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'testuser',
        password: 'wrongpass'
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid credentials'
    })
  })

  it('should return 200 for valid credentials', async () => {
    // First, let's generate the correct hash for 'testpass' with salt 'testsalt'
    const crypto = require('crypto')
    const correctHash = crypto.pbkdf2Sync('testpass', 'testsalt', 1000, 64, 'sha512').toString('hex')
    
    // Update test config with correct hash
    const testConfig = {
      admin: {
        username: 'testuser',
        salt: 'testsalt',
        password: correctHash
      }
    }
    fs.writeFileSync(testConfigPath, stringify(testConfig))

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'testuser',
        password: 'testpass'
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      message: 'Login success'
    })
  })
})
