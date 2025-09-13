import { render, screen, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '../../lib/auth'
import { useRouter } from 'next/navigation'

// Mock useRouter
jest.mock('next/navigation')
const mockPush = jest.fn()
const mockReplace = jest.fn()

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: mockReplace,
  })
})

// Test component that uses useAuth
function TestComponent() {
  const { user, login, logout, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {user ? (
        <div>
          <span data-testid="user-email">{user.email}</span>
          <button onClick={() => logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <span>Not logged in</span>
          <button onClick={() => login('test@example.com', 'password')}>Login</button>
        </div>
      )}
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should render loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show not logged in when no token in localStorage', async () => {
    localStorage.getItem = jest.fn().mockReturnValue(null)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })
  })

  it('should fetch user data when token exists in localStorage', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    localStorage.getItem = jest.fn().mockReturnValue('mock-token')
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/auth/me', {
      headers: {
        'Authorization': 'Bearer mock-token',
      },
    })
  })

  it('should handle login successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    localStorage.getItem = jest.fn().mockReturnValue(null)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        token: 'new-token',
        user: mockUser,
      }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })

    const loginButton = screen.getByText('Login')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com')
    })

    expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password',
      }),
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'new-token')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('should handle login failure', async () => {
    localStorage.getItem = jest.fn().mockReturnValue(null)
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })

    const loginButton = screen.getByText('Login')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })

    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should handle logout', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    localStorage.getItem = jest.fn().mockReturnValue('mock-token')
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockUser }),
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeInTheDocument()
    })

    const logoutButton = screen.getByText('Logout')
    logoutButton.click()

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })

  it('should redirect to login when token is invalid', async () => {
    localStorage.getItem = jest.fn().mockReturnValue('invalid-token')
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument()
    })

    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockReplace).toHaveBeenCalledWith('/login')
  })
})
