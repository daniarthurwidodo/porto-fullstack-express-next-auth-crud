import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserModal } from '../../../components/users/user-modal'
import { User } from '../../../types/user'

const mockUser: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  isActive: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
}

describe('UserModal Component', () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('should render modal when isOpen is true', () => {
    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    expect(screen.getByText('Add New User')).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(
      <UserModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    expect(screen.queryByText('Add New User')).not.toBeInTheDocument()
  })

  it('should show edit mode title and populate form when editing user', () => {
    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={mockUser}
        mode="edit"
      />
    )

    expect(screen.getByText('Edit User')).toBeInTheDocument()
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument()
  })

  it('should handle form submission for new user', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      isActive: true,
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: mockResponse }),
    })

    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    await user.type(screen.getByLabelText(/first name/i), 'Jane')
    await user.type(screen.getByLabelText(/last name/i), 'Smith')
    await user.type(screen.getByLabelText(/email/i), 'jane.smith@example.com')

    const submitButton = screen.getByRole('button', { name: /add user/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null',
        },
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          isActive: true,
        }),
      })
    })

    expect(mockOnSave).toHaveBeenCalledWith(mockResponse)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should handle form submission for editing user', async () => {
    const user = userEvent.setup()
    const updatedUser = { ...mockUser, firstName: 'Johnny' }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: updatedUser }),
    })

    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        user={mockUser}
        mode="edit"
      />
    )

    const firstNameInput = screen.getByDisplayValue('John')
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Johnny')

    const submitButton = screen.getByRole('button', { name: /update user/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`http://localhost:4001/api/users/${mockUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer null',
        },
        body: JSON.stringify({
          id: mockUser.id,
          firstName: 'Johnny',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          isActive: true,
        }),
      })
    })

    expect(mockOnSave).toHaveBeenCalledWith(updatedUser)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should show error message when API call fails', async () => {
    const user = userEvent.setup()

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already exists' }),
    })

    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    await user.type(screen.getByLabelText(/first name/i), 'Jane')
    await user.type(screen.getByLabelText(/last name/i), 'Smith')
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')

    const submitButton = screen.getByRole('button', { name: /add user/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('should call onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should toggle active status checkbox', async () => {
    const user = userEvent.setup()

    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    const checkbox = screen.getByRole('checkbox', { name: /active/i })
    expect(checkbox).toBeChecked()

    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()

    await user.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(
      <UserModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        mode="add"
      />
    )

    const submitButton = screen.getByRole('button', { name: /add user/i })
    await user.click(submitButton)

    // Should not call API or onSave with empty fields
    expect(fetch).not.toHaveBeenCalled()
    expect(mockOnSave).not.toHaveBeenCalled()
  })
})
