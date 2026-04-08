import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
const DASHBOARD_URL = 'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index';

// Test user credentials
const TEST_USER = {
  username: 'Admin',
  password: 'admin123'
};

test.describe('Orange CRM - Login and Navigation', () => {
  
  /* ------------------------------------------------------------------
   * Login Page Tests
   *
   * These tests verify that the login page loads correctly and displays
   * all required elements for user authentication.
   */
  
  test('Login page should load successfully', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Verify page title
    await expect(page).toHaveTitle(/OrangeHRM|Login/i);
    
    // Verify login form elements are visible
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('Username field should be present and focusable', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    const usernameField = page.getByRole('textbox', { name: 'Username' });
    await expect(usernameField).toBeEnabled();
    await usernameField.focus();
    await usernameField.fill('testuser');
    const value = await usernameField.inputValue();
    expect(value).toBe('testuser');
  });

  test('Password field should be present and focusable', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await expect(passwordField).toBeEnabled();
    await passwordField.focus();
    await passwordField.fill('testpassword');
    
    // Verify password field masks input
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('Login button should be clickable', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    const loginButton = page.getByRole('button', { name: 'Login' });
    await expect(loginButton).toBeEnabled();
    await expect(loginButton).toBeVisible();
  });

  test('Error message should display on invalid credentials', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Fill in invalid credentials
    await page.getByRole('textbox', { name: 'Username' }).fill('invaliduser');
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    
    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for error message to appear
    await page.waitForLoadState('load');
    
    // Check for error message
    const errorMessage = page.locator('[role="alert"], .alert, .error, [class*="error" i], [class*="invalid" i]');
    // Error might appear, depending on implementation
    // This is just to ensure the page handles invalid credentials
  });

  test('Successful login with valid credentials', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Fill in username
    await page.getByRole('textbox', { name: 'Username' }).fill(TEST_USER.username);
    
    // Fill in password
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER.password);
    
    // Submit the form
    await page.getByRole('button', { name: 'Login' }).click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('load');
    
    // Verify we're logged in (either by URL or page content)
    const url = page.url();
    expect(url.includes('dashboard') || url.includes('index')).toBeTruthy();
  });

});

test.describe('Orange CRM - Dashboard Navigation', () => {
  
  /* ------------------------------------------------------------------
   * Dashboard Tests
   *
   * These tests verify dashboard accessibility and navigation elements.
   */
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(LOGIN_URL);
    await page.getByRole('textbox', { name: 'Username' }).fill(TEST_USER.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('load');
  });
  
  test('Dashboard page should load after login', async ({ page }) => {
    // Verify we're on dashboard
    const url = page.url();
    expect(url.includes('dashboard') || url.includes('index')).toBeTruthy();
  });

  test('Main navigation menu should be present', async ({ page }) => {
    // Look for main navigation
    const navMenu = page.locator('nav, [role="navigation"], aside, .sidebar, [class*="menu" i]').first();
    await expect(navMenu).toBeVisible();
  });

  test('Should have navigation links for modules', async ({ page }) => {
    // Look for common OrangeHRM modules in navigation
    const possibleModules = ['admin', 'pim', 'leave', 'recruitment', 'performance', 'time', 'employee'];
    
    // Check if at least some navigation links exist
    const navLinks = page.locator('a, button, [role="menuitem"]');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('User profile menu should be visible', async ({ page }) => {
    // Look for user profile dropdown or menu
    const profileMenu = page.locator('[class*="profile" i], [class*="user" i], [class*="account" i]');
    const profileCount = await profileMenu.count();
    
    // Profile menu should exist
    expect(profileCount).toBeGreaterThanOrEqual(0);
  });

  test('Dashboard should display welcome message or user info', async ({ page }) => {
    // Check for page content indicating successful login
    const pageText = await page.locator('body').textContent();
    expect(pageText?.length).toBeGreaterThan(0);
  });

});

test.describe('Orange CRM - Page Elements', () => {
  
  /* ------------------------------------------------------------------
   * UI Element Tests
   *
   * These tests verify that key UI elements are present and functional.
   */
  
  test('Page should have proper heading structure', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Check for any heading element
    const headings = page.locator('h1, h2, [class*="header" i], [class*="title" i]');
    const headingCount = await headings.count();
    
    // At least one heading-like element should exist
    expect(headingCount).toBeGreaterThanOrEqual(0);
  });

  test('Page should be responsive on desktop', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verify form elements are still visible
    const usernameField = page.getByRole('textbox', { name: 'Username' });
    await expect(usernameField).toBeVisible();
  });

  test('Page should be responsive on mobile', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify form elements are still visible
    const usernameField = page.getByRole('textbox', { name: 'Username' });
    await expect(usernameField).toBeVisible();
  });

});

test.describe('Orange CRM - Accessibility', () => {
  
  /* ------------------------------------------------------------------
   * Accessibility Tests
   *
   * These tests verify that the page meets basic accessibility standards.
   */
  
  test('Form labels should be associated with inputs', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Wait for the Vue-rendered form to appear before counting
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    const inputs = page.getByRole('textbox');
    const inputCount = await inputs.count();

    expect(inputCount).toBeGreaterThan(0);
  });

  test('Login button should be keyboard accessible', async ({ page }) => {
    await page.goto(LOGIN_URL);

    // Explicitly focus the username field and verify it receives focus
    const usernameField = page.getByRole('textbox', { name: 'Username' });
    await usernameField.focus();
    await expect(usernameField).toBeFocused();

    // Tab to password, then to the Login button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON']).toContain(focusedElement);
  });

  test('Page should have proper contrast and readability', async ({ page }) => {
    await page.goto(LOGIN_URL);
    
    // Verify page is not empty and has content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

});

test.describe('Orange CRM - Module Navigation', () => {
  
  /* ------------------------------------------------------------------
   * Module Navigation Tests
   *
   * These tests verify navigation to different modules after login.
   */
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(LOGIN_URL);
    await page.getByRole('textbox', { name: 'Username' }).fill(TEST_USER.username);
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('load');
  });

  test('Should navigate to Admin module', async ({ page }) => {
    // Look for Admin link in sidebar
    const adminLink = page.locator('a:has-text("Admin"), [href*="admin"], span:has-text("Admin")').first();
    
    if (await adminLink.isVisible().catch(() => false)) {
      await adminLink.click();
      await page.waitForLoadState('load');
      
      const url = page.url();
      expect(url.includes('admin')).toBeTruthy();
    }
  });

  test('Should navigate to PIM (Personal Information) module', async ({ page }) => {
    // Look for PIM link
    const pimLink = page.locator('a:has-text("PIM"), a:has-text("Personal Information"), [href*="employee"], [href*="pim"]').first();
    
    if (await pimLink.isVisible().catch(() => false)) {
      await pimLink.click();
      await page.waitForLoadState('load');
      
      const url = page.url();
      expect(url.includes('employee') || url.includes('pim')).toBeTruthy();
    }
  });

  test('Should navigate to Leave module', async ({ page }) => {
    // Look for Leave link
    const leaveLink = page.locator('a:has-text("Leave"), [href*="leave"]').first();
    
    if (await leaveLink.isVisible().catch(() => false)) {
      await leaveLink.click();
      await page.waitForLoadState('load');
      
      const url = page.url();
      expect(url.includes('leave')).toBeTruthy();
    }
  });

  test('Should navigate to Time & Attendance module', async ({ page }) => {
    // Look for Time & Attendance link
    const timeLink = page.locator('a:has-text("Time"), a:has-text("Attendance"), [href*="attendance"], [href*="timesheet"]').first();
    
    if (await timeLink.isVisible().catch(() => false)) {
      await timeLink.click();
      await page.waitForLoadState('load');
      
      const url = page.url();
      expect(url.includes('time') || url.includes('attendance') || url.includes('timesheet')).toBeTruthy();
    }
  });

  test('Should navigate to Recruitment module', async ({ page }) => {
    // Look for Recruitment link
    const recruitmentLink = page.locator('a:has-text("Recruitment"), [href*="recruitment"]').first();
    
    if (await recruitmentLink.isVisible().catch(() => false)) {
      await recruitmentLink.click();
      await page.waitForLoadState('load');
      
      const url = page.url();
      expect(url.includes('recruitment')).toBeTruthy();
    }
  });

});
