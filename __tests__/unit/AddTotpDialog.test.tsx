import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddTotpDialog from '../../components/AddTotpDialog'

describe('AddTotpDialog Component', () => {
  const mockOnClose = jest.fn()
  const mockOnAdd = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnAdd.mockClear()
  })

  it('renders dialog when open', () => {
    render(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add New TOTP Code')).toBeInTheDocument()
    expect(screen.getByLabelText(/service name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/secret key/i)).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <AddTotpDialog
        open={false}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    const addButton = screen.getByRole('button', { name: /add totp/i })
    await user.click(addButton)
    
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('validates secret format', async () => {
    const user = userEvent.setup()
    render(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    const nameInput = screen.getByLabelText(/service name/i)
    const secretInput = screen.getByLabelText(/secret key/i)
    const addButton = screen.getByRole('button', { name: /add totp/i })
    
    await user.type(nameInput, 'Test Service')
    await user.type(secretInput, 'invalid-secret-123')
    await user.click(addButton)
    
    expect(screen.getByText(/secret must be a valid base32 string/i)).toBeInTheDocument()
    expect(mockOnAdd).not.toHaveBeenCalled()
  })

  it('calls onAdd with valid data', async () => {
    const user = userEvent.setup()
    render(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    const nameInput = screen.getByLabelText(/service name/i)
    const secretInput = screen.getByLabelText(/secret key/i)
    const addButton = screen.getByRole('button', { name: /add totp/i })
    
    await user.type(nameInput, 'Test Service')
    await user.type(secretInput, 'JBSWY3DPEHPK3PXP')
    await user.click(addButton)
    
    expect(mockOnAdd).toHaveBeenCalledWith('Test Service', 'JBSWY3DPEHPK3PXP')
  })

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('clears form when closed and reopened', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    const nameInput = screen.getByLabelText(/service name/i)
    const secretInput = screen.getByLabelText(/secret key/i)
    
    await user.type(nameInput, 'Test Service')
    await user.type(secretInput, 'JBSWY3DPEHPK3PXP')
    
    // Close dialog
    rerender(
      <AddTotpDialog
        open={false}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    // Reopen dialog
    rerender(
      <AddTotpDialog
        open={true}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    )
    
    const newNameInput = screen.getByLabelText(/service name/i)
    const newSecretInput = screen.getByLabelText(/secret key/i)
    
    expect(newNameInput).toHaveValue('')
    expect(newSecretInput).toHaveValue('')
  })
})
