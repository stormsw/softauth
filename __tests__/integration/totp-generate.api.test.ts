import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/totp/generate'
import * as speakeasy from 'speakeasy'

// Mock speakeasy
jest.mock('speakeasy', () => ({
  totp: jest.fn()
}))

describe('/api/totp/generate', () => {
  const mockSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>

  beforeEach(() => {
    mockSpeakeasy.totp.mockClear()
  })

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method Not Allowed'
    })
  })

  it('should return 400 when secret is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    })

    handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Secret is required'
    })
  })

  it('should generate OTP successfully', async () => {
    mockSpeakeasy.totp.mockReturnValue('123456')

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        secret: 'JBSWY3DPEHPK3PXP'
      },
    })

    handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      otp: '123456'
    })
    
    expect(mockSpeakeasy.totp).toHaveBeenCalledWith({
      secret: 'JBSWY3DPEHPK3PXP',
      encoding: 'base32',
      time: expect.any(Number),
      step: 30
    })
  })

  it('should handle speakeasy errors', async () => {
    mockSpeakeasy.totp.mockImplementation(() => {
      throw new Error('Invalid secret')
    })

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        secret: 'INVALID'
      },
    })

    handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Failed to generate OTP'
    })
  })
})
