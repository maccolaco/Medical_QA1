import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from '../pages/LoginPage'

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('ClaimsSense')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Create Account')).toBeInTheDocument()
  })

  it('has HIPAA mode checkbox', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Enable HIPAA mode (local processing only)')).toBeInTheDocument()
  })
})

