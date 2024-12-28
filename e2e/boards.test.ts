import { expect, test } from '@playwright/test';

test.describe('Board Management', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/boards');
	});

	test('should create a new board', async ({ page }) => {
		// Click create board button
		await page.click('button:has-text("New Board")');

		// Fill in board name
		await page.fill('input[name="name"]', 'Test Board');

		// Submit form
		await page.click('button[type="submit"]');

		// Verify board was created
		await expect(page.locator('h2:has-text("Test Board")')).toBeVisible();
	});

	test('should display board details', async ({ page }) => {
		// Create a board first
		await page.click('button:has-text("New Board")');
		await page.fill('input[name="name"]', 'Test Board');
		await page.click('button[type="submit"]');

		// Click on the board
		await page.click('h2:has-text("Test Board")');

		// Verify board components are visible
		await expect(page.locator('button:has-text("New List")')).toBeVisible();
		await expect(page.locator('button:has-text("New Card")')).toBeVisible();
	});

	test('should create a new list', async ({ page }) => {
		// Create and navigate to a board
		await page.click('button:has-text("New Board")');
		await page.fill('input[name="name"]', 'Test Board');
		await page.click('button[type="submit"]');
		await page.click('h2:has-text("Test Board")');

		// Create a new list
		await page.click('button:has-text("New List")');
		await page.fill('input[name="name"]', 'Test List');
		await page.click('button[type="submit"]');

		// Verify list was created
		await expect(page.locator('h3:has-text("Test List")')).toBeVisible();
	});

	test('should create a new card', async ({ page }) => {
		// Create and navigate to a board
		await page.click('button:has-text("New Board")');
		await page.fill('input[name="name"]', 'Test Board');
		await page.click('button[type="submit"]');
		await page.click('h2:has-text("Test Board")');

		// Create a list first
		await page.click('button:has-text("New List")');
		await page.fill('input[name="name"]', 'Test List');
		await page.click('button[type="submit"]');

		// Create a new card
		await page.click('button:has-text("New Card")');
		await page.fill('input[name="title"]', 'Test Card');
		await page.click('button[type="submit"]');

		// Verify card was created
		await expect(page.locator('div:has-text("Test Card")')).toBeVisible();
	});

	test('should assign a user to a card', async ({ page }) => {
		// Create and navigate to a board with a list and card
		await page.click('button:has-text("New Board")');
		await page.fill('input[name="name"]', 'Test Board');
		await page.click('button[type="submit"]');
		await page.click('h2:has-text("Test Board")');

		await page.click('button:has-text("New List")');
		await page.fill('input[name="name"]', 'Test List');
		await page.click('button[type="submit"]');

		await page.click('button:has-text("New Card")');
		await page.fill('input[name="title"]', 'Test Card');
		await page.click('button[type="submit"]');

		// Edit the card
		await page.click('div:has-text("Test Card")');

		// Select an assignee from the dropdown
		await page.selectOption('select[name="assigneeId"]', { index: 1 });
		await page.click('button[type="submit"]');

		// Verify the card shows the assigned user
		await expect(page.locator('.card-assignee')).toBeVisible();
	});

	test('should move a card between lists', async ({ page }) => {
		// Create and navigate to a board
		await page.click('button:has-text("New Board")');
		await page.fill('input[name="name"]', 'Test Board');
		await page.click('button[type="submit"]');
		await page.click('h2:has-text("Test Board")');

		// Create two lists
		await page.click('button:has-text("New List")');
		await page.fill('input[name="name"]', 'List 1');
		await page.click('button[type="submit"]');

		await page.click('button:has-text("New List")');
		await page.fill('input[name="name"]', 'List 2');
		await page.click('button[type="submit"]');

		// Create a card in the first list
		await page.click('button:has-text("New Card")');
		await page.fill('input[name="title"]', 'Test Card');
		await page.click('button[type="submit"]');

		// Drag and drop the card to the second list
		const card = page.locator('div:has-text("Test Card")').first();
		const list2 = page.locator('h3:has-text("List 2")');

		await card.dragTo(list2);

		// Verify the card is now in the second list
		const list2Cards = page.locator('h3:has-text("List 2")').locator('..').locator('.card');
		await expect(list2Cards.locator('text=Test Card')).toBeVisible();
	});
});
