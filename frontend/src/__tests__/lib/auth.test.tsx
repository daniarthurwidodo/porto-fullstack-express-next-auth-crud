import { render, screen, waitFor } from '@testing-library/react'
import { useAuth, AuthProvider } from '../../lib/auth'
import { useRouter } from 'next/navigation'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

beforeEach(() => {
  mockUseRouter.mockReturnValue({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
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
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('should render loading state initially', () => {
    // Mock localStorage to return a token so the provider attempts to fetch
    mockLocalStorage.getItem.mockReturnValue('some-token')
    // Mock a slow fetch to keep loading state visible
    global.fetch = jest.fn(() => new Promise(() => {})) // Never resolves

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should show not logged in when no token in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)

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

    mockLocalStorage.getItem.mockReturnValue('mock-token')
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

    expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/auth/profile', {
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

    mockLocalStorage.getItem.mockReturnValue(null)
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

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'new-token')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('should handle login failure', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)
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

    expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('should handle logout', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    }

    mockLocalStorage.getItem.mockReturnValue('mock-token')
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

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should redirect to login when token is invalid', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token')
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

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
  })
})
