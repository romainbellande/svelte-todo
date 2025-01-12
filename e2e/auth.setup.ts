import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, './.auth/user.json');

setup('authenticate', async ({ page }) => {
	// Navigate to the login page
	await page.goto('/login');

	// Fill in the login form
	await page.fill('input[name="email"]', 'admin@example.com');
	await page.fill('input[name="password"]', 'mypassword');

	// Submit the form
	await page.click('button[type="submit"]');

	// Wait for navigation and verify we're logged in
	await expect(page.locator('data-test-id=header-user-email')).toBeVisible();

	// Get the session storage state
	await page.context().storageState({ path: authFile });
});
