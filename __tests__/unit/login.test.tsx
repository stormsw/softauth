import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../pages/login'

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Login Component', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockPush.mockClear()
  })

  it('renders login form correctly', () => {
    render(<Login />)
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('updates form fields when typing', async () => {
    const user = userEvent.setup()
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Login successful' }),
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(mockFetch).toHaveBeenCalledWith('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })
  })

  it('redirects to dashboard on successful login', async () => {
    const user = userEvent.setup()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Login successful' }),
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    
    mockFetch.mockReturnValueOnce(promise)
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(screen.getByRole('button', { name: /signing in.../i })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
    
    // Resolve the promise
    resolvePromise!({ ok: true, json: async () => ({}) })
  })

  it('shows error alert on failed login', async () => {
    const user = userEvent.setup()
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    })
    
    render(<Login />)
    
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Login failed')
    })
    
    alertSpy.mockRestore()
  })
})
