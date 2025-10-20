import { test, expect } from '@playwright/test'

test.describe('ClaimsSense E2E Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/ClaimsSense/)
    await expect(page.getByText('ClaimsSense')).toBeVisible()
    await expect(page.getByText('Sign In')).toBeVisible()
    await expect(page.getByText('Create Account')).toBeVisible()
  })

  test('should create new user account', async ({ page }) => {
    await page.goto('/')
    
    // Click Create Account tab
    await page.getByText('Create Account').click()
    
    // Fill in the form
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="username"]', 'testuser')
    await page.selectOption('select[name="role"]', 'BillingCoder')
    await page.fill('input[name="password"]', 'testpassword123')
    
    // Check HIPAA mode
    await page.check('input[name="hipaa-mode"]')
    
    // Submit the form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should redirect to dashboard
    await expect(page.getByText('Upload Claims')).toBeVisible()
  })

  test('should navigate to upload page', async ({ page }) => {
    // This test assumes we're already logged in
    await page.goto('/upload')
    
    await expect(page.getByText('Upload Claims')).toBeVisible()
    await expect(page.getByText('Drag & drop files here')).toBeVisible()
  })

  test('should navigate to queues page', async ({ page }) => {
    await page.goto('/queues')
    
    await expect(page.getByText('All Queues')).toBeVisible()
    await expect(page.getByText('Search claims...')).toBeVisible()
  })

  test('should navigate to analytics page', async ({ page }) => {
    await page.goto('/analytics')
    
    await expect(page.getByText('Analytics Dashboard')).toBeVisible()
    await expect(page.getByText('Total Claims')).toBeVisible()
  })
})

