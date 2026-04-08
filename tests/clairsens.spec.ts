// Playwright test suite for ClairSens website
//
// Tests are written against the live site structure verified from
// accessibility snapshots.  Locators use actual text, roles, and
// placeholder values observed on the page.

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://clairsens.com';

test.describe('ClairSens website', () => {

  /* ------------------------------------------------------------------
   * Home page tests
   */
  test.describe('Home page', () => {
    test('should load and display hero content', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      await expect(page).toHaveTitle(/ClairSens/i);
      await expect(page.getByRole('heading', { name: /Build Smarter/i })).toBeVisible();
      await expect(page.getByText(/full-cycle technology partner/i)).toBeVisible();
    });

    test('navigation links route to their pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      const nav = page.getByRole('navigation');

      await nav.getByRole('link', { name: /about us/i }).click();
      await expect(page).toHaveURL(/\/about(?:#.*)?$/);

      await page.goto(`${BASE_URL}/`);
      // Use exact match to avoid partial hits (e.g. "Services" in "Case Studies")
      await nav.getByRole('link', { name: /^services$/i }).click();
      await expect(page).toHaveURL(/\/services(?:#.*)?$/);

      await page.goto(`${BASE_URL}/`);
      // The nav label is "Case Studies" but it routes to /portfolio
      await nav.getByRole('link', { name: /case studies/i }).click();
      await expect(page).toHaveURL(/\/portfolio(?:#.*)?$/);

      await page.goto(`${BASE_URL}/`);
      await nav.getByRole('link', { name: /contact hq/i }).click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });

    test('Initialize Audit header button navigates to contact page', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);
      // Scope to banner to avoid ambiguity with in-page buttons
      await page.getByRole('banner').getByRole('link', { name: /initialize audit/i }).click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });
  });

  /* ------------------------------------------------------------------
   * About page tests
   */
  test.describe('About page', () => {
    test('should display mission statement and headings', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      await expect(page.locator('h1')).toContainText(/builds it right/i);
      await expect(page.getByText(/ClairSens was founded/i)).toBeVisible();
    });
  });

  /* ------------------------------------------------------------------
   * Services page tests
   *
   * The page shows four capability cards (App & Web Development,
   * Intelligent Automations, Engine & Logic Optimization, Human QA)
   * each with an "Open Specification" toggle, and three pricing cards
   * with "Start Conversation" CTAs.
   */
  test.describe('Services page', () => {
    test('should display all four service capability cards', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      await expect(page.getByRole('heading', { name: /App & Web Development/i })).toBeVisible();
      // "Intelligent Automations" also appears in the pricing section, so scope to first
      await expect(page.getByRole('heading', { name: /Intelligent Automations/i }).first()).toBeVisible();
      await expect(page.getByRole('heading', { name: /Engine & Logic Optimization/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Human QA/i })).toBeVisible();
    });

    test('can open and close a service specification panel', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      // Each card has an "Open Specification" clickable area that expands inline
      await page.getByText('Open Specification').first().click();
      // The expanded panel shows detailed content
      await expect(page.getByRole('heading', { name: /Engagement Scope/i })).toBeVisible();
      // Close the panel using the dedicated button
      await page.getByRole('button', { name: /close specification/i }).click();
      await expect(page.getByRole('heading', { name: /Engagement Scope/i })).toBeHidden();
    });

    test('pricing card CTA navigates to contact', async ({ page }) => {
      await page.goto(`${BASE_URL}/services`);
      // All pricing cards use "Start Conversation" linking to /contact
      await page.getByRole('link', { name: /start conversation/i }).first().click();
      await expect(page).toHaveURL(/\/contact/);
    });
  });

  /* ------------------------------------------------------------------
   * Case Studies page tests  (URL: /portfolio)
   *
   * The page heading is "Verification & Build Results." and has four
   * category filter buttons.
   */
  test.describe('Case Studies page', () => {
    test('should display heading and all filter categories', async ({ page }) => {
      await page.goto(`${BASE_URL}/portfolio`);
      await expect(page.getByRole('heading', { name: /Verification & Build Results/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /App Engineering/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /AI Automation/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Engine Hardening/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Logic Catch/i })).toBeVisible();
    });

    test('clicking a filter category keeps the user on the portfolio page', async ({ page }) => {
      await page.goto(`${BASE_URL}/portfolio`);
      // Default view shows auth/session code
      await expect(page.locator('code')).toContainText(/session|jwt|auth/i);
      // Click a different category
      await page.getByRole('button', { name: /AI Automation/i }).click();
      // Page should not navigate away
      await expect(page).toHaveURL(/\/portfolio/);
      await page.getByRole('button', { name: /Engine Hardening/i }).click();
      await expect(page).toHaveURL(/\/portfolio/);
    });
  });

  /* ------------------------------------------------------------------
   * Contact page tests
   *
   * Form fields use custom label divs (not <label> elements), so
   * placeholders are used as locators.  The submit button reads
   * "Initialize Handshake".
   */
  test.describe('Contact page', () => {
    test('should prevent submission when required fields are empty', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      await page.getByRole('button', { name: /initialize handshake/i }).click();
      // Page should remain on /contact (custom or browser validation)
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });

    test('should accept valid form input and submit', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      await page.getByPlaceholder('e.g. Alex Chen').fill('Test User');
      await page.getByPlaceholder('name@company.com').fill('test@example.com');
      await page.getByPlaceholder('github.com/...').fill('github.com/example');
      await page.getByRole('combobox').selectOption('Diagnostic Logic Audit');
      await page.getByPlaceholder(/Describe your current build/i).fill(
        'Please verify the prompt logic for our application.'
      );
      await page.getByRole('button', { name: /initialize handshake/i }).click();
      // After submission, stay on /contact (inline success) or redirect
      await expect(page).toHaveURL(/\/contact/);
    });
  });

  /* ------------------------------------------------------------------
   * Vibe-Check service page tests  (URL: /services/vibe-check)
   */
  test.describe('Vibe-Check page', () => {
    test('should load and show call-to-action', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/vibe-check`);
      await expect(page.locator('h1')).toContainText(/vibe.check/i);
      // Scope to main to avoid the header "Initialize Audit" link
      const cta = page.locator('main').getByRole('link', { name: /initialize audit/i });
      await expect(cta).toBeVisible();
      await cta.click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });
  });

  /* ------------------------------------------------------------------
   * Fractional QA service page tests  (URL: /services/fractional-qa)
   */
  test.describe('Fractional QA page', () => {
    test('should load and navigate via call-to-action', async ({ page }) => {
      await page.goto(`${BASE_URL}/services/fractional-qa`);
      await expect(page.locator('h1')).toContainText(/fractional qa/i);
      // Use the link role (the button is wrapped inside an anchor)
      const cta = page.getByRole('link', { name: /request fractional team/i });
      await expect(cta).toBeVisible();
      await cta.click();
      await expect(page).toHaveURL(/\/contact(?:#.*)?$/);
    });
  });

  /* ------------------------------------------------------------------
   * Footer link tests
   *
   * Footer sections: "Capabilities" (→ /services), "Company" (various),
   * "Connect" (→ /contact).
   */
  test.describe('Footer links', () => {
    test('capabilities links lead to services page', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      const footer = page.getByRole('contentinfo');
      const capabilityLinks = [
        /App & Web Development/i,
        /Intelligent Automations/i,
        /Logic Optimization/i,
        /Human QA/i,
      ];
      for (const name of capabilityLinks) {
        await footer.getByRole('link', { name }).click();
        await expect(page).toHaveURL(/\/services(?:#.*)?$/);
        await page.goto(`${BASE_URL}/about`);
      }
    });

    test('company links navigate correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`);
      const footer = page.getByRole('contentinfo');

      await footer.getByRole('link', { name: /about us/i }).click();
      await expect(page).toHaveURL(/\/about/);
      await page.goto(`${BASE_URL}/contact`);

      await footer.getByRole('link', { name: /^portfolio$/i }).click();
      await expect(page).toHaveURL(/\/portfolio/);
      await page.goto(`${BASE_URL}/contact`);

      // "Nairobi Advantage" links to /about#nairobi-advantage (not a 404)
      await footer.getByRole('link', { name: /nairobi advantage/i }).click();
      await expect(page).toHaveURL(/nairobi-advantage/);
    });

    test('connect links lead to contact', async ({ page }) => {
      await page.goto(`${BASE_URL}/about`);
      const footer = page.getByRole('contentinfo');
      const connectLinks = [
        /Contact Us/i,
        /Start a Project/i,
      ];
      for (const name of connectLinks) {
        await footer.getByRole('link', { name }).click();
        await expect(page).toHaveURL(/\/contact/);
        await page.goto(`${BASE_URL}/about`);
      }
    });
  });
});
