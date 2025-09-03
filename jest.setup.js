import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock crypto for Node.js environment
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomBytes: (size) => Buffer.alloc(size),
    pbkdf2Sync: jest.fn(() => Buffer.from('mocked-hash')),
  },
})

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
})
