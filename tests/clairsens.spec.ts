// Playwright test suite for ClairSens website
//
// This file contains end‑to‑end tests that exercise the primary user
// journeys across the ClairSens web application.  Each section is
// separated by comments to clearly indicate the page being tested.
// Tests cover navigation, page content, modals, form validation,
// successful form submission, and deep links from pricing cards.  If a
// selector fails because the site changes, adjust the locator or
// regular expression accordingly.

import { test, expect } from '@playwright/test';

// The base URL of the application under test.  If you use a local
// environment or staging deployment, set BASE_URL accordingly.
const BASE_URL = process.env.BASE_URL || 'https://clairsens.com';

// Wrap all tests in a top‑level describe block so Playwright groups
// them together in the report.
test.describe('ClairSens website', () => {

  /* ------------------------------------------------------------------
   * Home page tests
   *
   * These tests verify that the home page loads correctly, displays
   * key content, and that the primary navigation links (header
   * navigation and the “Get Audited” call‑to‑action) route to the
   * expected pages.  The home page also contains buttons that link
   * deeper into the site (e.g. Explore Services) – those are tested
   * implicitly through navigation tests.
   */
  test.describe('Home page', () => {
    test('should load and display hero content', async ({ page }) => {
      await page.goto(`/`);
      // Check that the page title contains the company name
      await expect(page).toHaveTitle(/ClairSens/i);
      await expect(page).toHaveTitle(/ClairSens/i); 
      await expect(page.getByRole('heading', { name: /AI Writes the Code/i })).toBeVisible(); 
      await expect(page.getByText(/We build the Trust/i)).toBeVisible();
    });

    test('navigation links route to their pages', async ({ page }) => {
      await page.goto(`/`);
      // Click “About Us” in the header and verify URL
      await page.getByRole('link', { name: /about us/i }).click();
      await expect(page).toHaveURL(/\/about(?:#.*)?$/);
      // Return to home for the next link
      await page.goto(`${BASE_URL}/`);
      // Click “Services” and verify URL
      await page.getByRole('link', { name: /services/i }).click();
      await expect(page).toHaveURL(/\/services(?:#.*)?$/);
      await page.goto(`${BASE_URL}/`);
      // Click “Portfolio”
      await page.getByRole('link', { name: /portfolio/i }).click();
      await expect(page).toHaveURL(/\/portfolio(?:#.*)?$/);
      await page.goto(`${BASE_URL}/`);
      // Click “Contact HQ”
      await page.getByRole('link', { name: /contact hq/i }).click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });

    test('Get Audited button navigates to contact page', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      // The call‑to‑action appears in the header (sometimes on the
      // right).  Use a role=link query with partial name match.
      await page.getByRole('link', { name: /get audited/i }).click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });
  });

  /* ------------------------------------------------------------------
   * About page tests
   *
   * These tests ensure that the About page renders correctly and
   * contains the expected messaging and sections.  This is a static
   * page with mission statements and team information.
   */
  test.describe('About page', () => {
    test('should display mission statement and headings', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      // The page should contain a heading emphasising the human firewall
      await expect(page.locator('h1, h2')).toContainText(/firewall|trust/i);
      // Confirm that at least one paragraph explains the company’s
      // mission.  If the exact wording changes, loosen the regex.
      await expect(page.locator('text=We verify')).toBeVisible();
    });
  });

  /* ------------------------------------------------------------------
   * Services page tests
   *
   * The Services page offers two categories (AI Logic Audits and
   * Human Engineering) with cards that open modal specifications and
   * pricing cards with deep links to individual service pages.  Tests
   * here verify category toggling, modal interactions, and navigation.
   */
  test.describe('Services page', () => {
    test('should toggle between service categories', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      // By default the AI Logic Audits tab is active.  Click the
      // “Human Engineering” tab and verify that its content is visible.
      await page.getByRole('button', { name: /human engineering/i }).click();
      // After toggling, expect at least one human engineering card
      await expect(page.locator('text=Fractional QA')).toBeVisible();
      // Toggle back to AI Logic Audits
      await page.getByRole('button', { name: /ai logic audits/i }).click();
      await expect(page.locator('text=Logic & Hallucination')).toBeVisible();
    });

    test('can open and close a service specification modal', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      // Find a service card by heading text and open its specification
      await page.getByRole('link', { name: /prompt\-to\-product verification/i }).click();
      // Expect the modal dialog to appear with detailed text
      const modal = page.getByRole('dialog');
      await expect(modal).toContainText(/open source prompt/i);
      // Close the modal
      await modal.getByRole('button', { name: /close specs/i }).click();
      await expect(modal).toBeHidden();
    });

    test('initializing a service from modal navigates to contact page', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      // Open the spec modal again
      await page.getByRole('link', { name: /security & compliance/i }).click();
      const modal = page.getByRole('dialog');
      // Click the call‑to‑action inside the modal
      await modal.getByRole('button', { name: /initialize this audit/i }).click();
      // The page should now be the contact page
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });

    test('pricing card links navigate to correct service pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      // Click on the “Start Audit” button in the Vibe‑Check Lite pricing card
      await page.getByRole('button', { name: /start audit/i }).click();
      await expect(page).toHaveURL(/\/services\/vibe\-check/);
      // Navigate back to services
      await page.goto(`${BASE_URL}/services`);
      // Click the “Go Global” button on the Fractional QA card
      await page.getByRole('button', { name: /go global/i }).click();
      await expect(page).toHaveURL(/\/services\/fractional\-qa/);
    });
  });

  /* ------------------------------------------------------------------
   * Portfolio page tests
   *
   * The Portfolio page showcases sample audit scenarios via an
   * interactive list.  Selecting a scenario updates the displayed
   * code snippet and insight text.  These tests verify that clicking
   * on different scenarios updates the content accordingly.
   */
  test.describe('Portfolio page', () => {
    test('should switch audit scenarios and update content', async ({ page }) => {
      await page.goto(`${BASE_URL}/portfolio`);
      // Select the “Security Bypass” scenario
      await page.getByRole('button', { name: /security bypass/i }).click();
      // Expect code block or description text specific to this scenario
      await expect(page.locator('pre, code, p')).toContainText(/multi\-factor|auth|bypass/i);
      // Select another scenario, e.g. “Intent Drift”
      await page.getByRole('button', { name: /intent drift/i }).click();
      await expect(page.locator('pre, code, p')).toContainText(/drift|context/i);
    });
  });

  /* ------------------------------------------------------------------
   * Contact page tests
   *
   * The contact page features a form to request a quality audit.  These
   * tests cover basic validations and a full submission flow.  Note
   * that HTML5 form validation prevents submission when required
   * fields are empty or email addresses are malformed.  To verify
   * validation, we attempt submission with missing values and then
   * provide valid inputs.  If the success state ever changes, update
   * the text match accordingly.
   */
  test.describe('Contact page', () => {
    test('should prevent submission when required fields are empty', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      // Attempt to click the submit button without filling fields
      const submit = page.getByRole('button', { name: /initialize audit/i });
      await submit.click();
      // Because of HTML5 validation, the page should stay on contact
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
      // The browser will focus the first invalid input (Full Name)
      const focused = await page.evaluate(() => document.activeElement?.getAttribute('name'));
      expect(focused).toMatch(/name/i);
    });

    test('should display error on invalid email and then submit successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      // Fill the form with a name and invalid email
      await page.getByLabel(/full name/i).fill('Test User');
      await page.getByLabel(/work email/i).fill('invalid-email');
      await page.getByLabel(/github url/i).fill('https://github.com/example');
      // Try to submit with invalid email
      await page.getByRole('button', { name: /initialize audit/i }).click();
      // The invalid email field should remain focused due to validation
      let focused = await page.evaluate(() => document.activeElement?.getAttribute('type'));
      expect(focused).toBe('email');
      // Now enter a valid email and fill the remaining fields
      await page.getByLabel(/work email/i).fill('test@example.com');
      // Optionally choose a service from the dropdown.  If the select
      // element has a placeholder, we can select by label.  This
      // example selects the first option from the list.
      const serviceSelect = page.getByRole('combobox');
      await serviceSelect.selectOption({ index: 1 });
      // Fill the audit scope text area
      await page.getByLabel(/audit scope|requirements/i).fill('Please verify the prompt logic for our application.');
      // Submit the form
      await page.getByRole('button', { name: /initialize audit/i }).click();
      // After successful submission, the page displays a success message
      await expect(page.locator('text=audit initialized')).toBeVisible();
      // And the user can send another request
      await expect(page.getByRole('button', { name: /send another/i })).toBeVisible();
    });
  });

  /* ------------------------------------------------------------------
   * Vibe‑Check service page tests
   *
   * The /services/vibe‑check page is the detailed landing page for
   * Vibe‑Check Lite.  Tests here ensure that the page renders
   * correctly and that its call‑to‑actions work.
   */
  test.describe('Vibe‑Check page', () => {
    test('should load and show call‑to‑actions', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/vibe-check`);
      // Confirm that the page headline contains the service name
      await expect(page.locator('h1, h2')).toContainText(/vibe\-check/i);
      // The page should have a button to initialize the audit
      await expect(page.getByRole('button', { name: /initialize audit/i })).toBeVisible();
      // Click the button and verify navigation to contact
      await page.getByRole('button', { name: /initialize audit/i }).click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });
  });

  /* ------------------------------------------------------------------
   * Fractional QA service page tests
   *
   * The /services/fractional‑qa page presents the Fractional QA
   * offering.  Tests verify that the page loads and that the “Request
   * Fractional Team” button routes correctly.
   */
  test.describe('Fractional QA page', () => {
    test('should load and navigate via call‑to‑action', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/fractional-qa`);
      // Check the heading contains “Fractional QA”
      await expect(page.locator('h1, h2')).toContainText(/fractional qa/i);
      // The call‑to‑action may read “Request Fractional Team”
      const cta = page.getByRole('button', { name: /request fractional team/i });
      await expect(cta).toBeVisible();
      // Click the CTA and verify navigation to contact
      await cta.click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });
  });

  /* ------------------------------------------------------------------
   * Footer link tests
   *
   * The footer contains a collection of links for “Verification”, “Hub”
   * and “Connect”.  These tests confirm that each footer link
   * directs users to the correct section or page.  One known issue is
   * the “Nairobi Advantage” link, which currently triggers a 404
   * message (“Vibe Lost”).  We include a check for that as well.
   */
  test.describe('Footer links', () => {
    test('verification links lead to services page', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      // Each link under Verification (Logic Audits, Security & Compliance,
      // UX Usability) should route to /services
      const verificationLinks = [
        /logic audits/i,
        /security & compliance/i,
        /ux usability/i,
      ];
      for (const link of verificationLinks) {
        await page.getByRole('link', { name: link }).click();
        await expect(page).toHaveURL(/\/services(?:#.*)?$/);
        // Navigate back to contact to test the next link
        await page.goto(`${BASE_URL}/contact`);
      }
    });
    test('hub links navigate correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      // About Us link
      await page.getByRole('link', { name: /about us/i }).click();
      await expect(page).toHaveURL(/\/about/);
      await page.goto(`${BASE_URL}/contact`);
      // Nairobi Advantage link – expected to 404
      await page.getByRole('link', { name: /nairobi advantage/i }).click();
      await expect(page).toHaveURL(/nairobi\-advantage/);
      await expect(page.locator('text=vibe lost')).toBeVisible();
      // Back to the hub page after 404 test
      await page.goto(`${BASE_URL}/contact`);
      // Audit Portfolio link
      await page.getByRole('link', { name: /audit portfolio/i }).click();
      await expect(page).toHaveURL(/\/portfolio/);
    });
    test('connect links lead to contact', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      // Request Audit, Get a Quote and Nairobi HQ all link to contact
      const connectLinks = [
        /request audit/i,
        /get a quote/i,
        /nairobi hq/i,
      ];
      for (const link of connectLinks) {
        await page.getByRole('link', { name: link }).click();
        await expect(page).toHaveURL(/\/contact/);
        await page.goto(`${BASE_URL}/about`);
      }
    });
  });
});