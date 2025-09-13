import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../../../app/login/page'
import { useAuth } from '../../../lib/auth'

// Mock the auth context
jest.mock('../../../lib/auth', () => ({
  useAuth: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

describe('LoginPage', () => {
  const mockLogin = jest.fn()
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: null,
      login: mockLogin,
      logout: jest.fn(),
      loading: false,
    })
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByText('Porto Admin')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your admin dashboard')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should render test credentials', () => {
    render(<LoginPage />)

    expect(screen.getByText('Test Credentials:')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('password123')).toBeInTheDocument()
  })

  it('should render sign up link', () => {
    render(<LoginPage />)

    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/register')
  })

  it('should handle form submission with valid data', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(undefined)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()
    // Simulate clicking the form to trigger loading state
    mockLogin.mockImplementation(() => new Promise(() => {})) // Never resolves to keep loading

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      const loadingButton = screen.getByRole('button', { name: /signing in/i })
      expect(loadingButton).toBeDisabled()
      expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })
  })

  it('should show error message when login fails', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(false) // Login fails

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(<LoginPage />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    // Should not call login with empty fields
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('should clear error message when user starts typing', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue(false) // Login fails

    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Trigger error
    await user.type(emailInput, 'wrong@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    })

    // Clear error by typing
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument()
  })
})
