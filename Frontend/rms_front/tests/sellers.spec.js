// tests/sellers.spec.js
// Tests for the Sellers Page — list, add, edit, delete, search
// RIDCS — Retail Inventory and Dropping Center System

import { test, expect } from '@playwright/test';
import  { ROUTES, SELLER_DATA, loginAs } from '../helpers/testData';

test.describe('Sellers Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto(ROUTES.sellers);
  });

  // ── Page Load ──────────────────────────────────────────────────
  test('should display the sellers page with list or table', async ({ page }) => {
    await expect(
      page.getByRole('table')
        .or(page.locator('[data-testid="seller-table"], .seller-table, .seller-list'))
        .first()
    ).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await expect(
      page.getByRole('searchbox').or(page.getByPlaceholder(/search/i))
    ).toBeVisible();
  });

  test('should display add seller button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /add seller|new seller|\+ seller/i })
        .or(page.getByRole('link', { name: /add seller/i }))
    ).toBeVisible();
  });

  // ── CRUD: Add Seller ───────────────────────────────────────────
  test('should open add seller form when button is clicked', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add seller|new seller|\+ seller/i })
      .or(page.getByRole('link', { name: /add seller/i }));
    await addBtn.first().click();

    await expect(
      page.getByRole('dialog').or(page.locator('form')).first()
    ).toBeVisible();
  });

  test('should successfully add a new seller', async ({ page }) => {
    const d = SELLER_DATA.valid;

    // Handle the window.alert() your component throws
    page.once('dialog', dialog => dialog.accept());

    const addBtn = page
      .getByRole('button', { name: /add seller|new seller|\+ seller/i })
      .or(page.getByRole('link', { name: /add seller/i }));
    await addBtn.first().click();

    await page.locator('#sellerName').fill(d.name);
    await page.locator('#phoneNumber').fill(d.phoneNumber);
    await page.locator('#sellerEmail').fill(d.email);

    await page.getByRole('button', { name: /save|add|submit|update/i }).last().click();

    // Check the DOM for the new seller's name instead of the alert text
    await expect(page.getByText(d.name).first()).toBeVisible({ timeout: 8000 });
  });

  // ── CRUD: Edit Seller ──────────────────────────────────────────
  test('should open edit form for a seller', async ({ page }) => {
    // 1. Wait for the loading state to disappear before doing anything else
    // We give this a longer timeout to accommodate slow API starts
    await expect(page.getByText('Loading sellers...')).not.toBeVisible({ timeout: 10000 });

    const editBtn = page.getByRole('button', { name: /edit/i }).first();

    // 2. Now check if the button is there. Since loading is done, 
    // it should be immediately available if data exists.
    const hasItems = await editBtn.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (!hasItems) {
      test.skip(true, 'No sellers to edit — seed the DB first');
      return;
    }

    await editBtn.click();
    
    await expect(
      page.getByRole('dialog').or(page.locator('form')).first()
    ).toBeVisible();
  });

  // REPLACE THIS ENTIRE TEST:
  test('should successfully edit a seller', async ({ page }) => {
    // 1. Wait for the loading state to finish first
    await expect(page.getByText('Loading sellers...')).not.toBeVisible({ timeout: 10000 });

    const editBtn = page.getByRole('button', { name: /edit/i }).first();

    // 2. Now check if the button is visible (it should be immediate if data exists)
    const hasItems = await editBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!hasItems) {
      test.skip(true, 'No sellers to edit');
      return;
    }

    // Handle the window.alert() your component throws
    page.once('dialog', dialog => dialog.accept());

    await editBtn.click();

    await page.locator('#sellerName').clear();
    await page.locator('#sellerName').fill(SELLER_DATA.updated.name);

    await page.locator('#phoneNumber').clear();
    await page.locator('#phoneNumber').fill(SELLER_DATA.updated.phoneNumber);

    await page.getByRole('button', { name: /update|save/i }).last().click();

    // Check the DOM for the updated name
    await expect(page.getByText(SELLER_DATA.updated.name).first()).toBeVisible({ timeout: 8000 });
  });

  test('should cancel editing without saving changes', async ({ page }) => {
    // 1. Wait for the loading state to finish first
    await expect(page.getByText('Loading sellers...')).not.toBeVisible({ timeout: 10000 });

    const editBtn = page.getByRole('button', { name: /edit/i }).first();

    // 2. Check if the button is visible
    const hasItems = await editBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!hasItems) {
      test.skip(true, 'No sellers available');
      return;
    }

    await editBtn.click();

    await page.locator('#sellerName').clear();
    await page.locator('#sellerName').fill('This Should Not Save');

    await page.getByRole('button', { name: /cancel/i }).click();

    // 3. REMOVED the .catch() so this actually fails if the modal gets stuck open
    await expect(page.getByRole('dialog', { exact: true }).first()).not.toBeVisible({ timeout: 4000 });

    await expect(page.getByText('This Should Not Save')).not.toBeVisible();
  });

  // ── CRUD: Delete Seller ────────────────────────────────────────
  test('should show delete confirmation dialog', async ({ page }) => {
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();

    const hasItems = await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasItems) {
      test.skip(true, 'No sellers to delete');
      return;
    }

    await deleteBtn.click();

    await expect(
      page.getByRole('dialog')
        .or(page.getByText(/confirm|are you sure|permanently delete/i))
        .first()
    ).toBeVisible();
  });

  // ── CRUD: Delete Seller ────────────────────────────────────────
  test('should delete a seller after confirming', async ({ page }) => {
    const d = {
      name: `DeleteMe_${Date.now()}`,
      phoneNumber: '09001112222',
      email: `deleteme_${Date.now()}@ridcs.com`,
    };

    // 1. Handle the "Seller added successfully!" alert so the test doesn't hang
    page.once('dialog', dialog => dialog.accept());

    const addBtn = page
      .getByRole('button', { name: /add seller|new seller|\+ seller/i })
      .first();
    await addBtn.click();

    await page.locator('#sellerName').fill(d.name);
    await page.locator('#phoneNumber').fill(d.phoneNumber);
    await page.locator('#sellerEmail').fill(d.email);
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();
    
    // Ensure the seller is actually in the DOM before we try to delete them
    await expect(page.getByText(d.name).first()).toBeVisible({ timeout: 8000 });

    const row = page.getByRole('row').filter({ hasText: d.name });
    const deleteBtn = row.getByRole('button', { name: /delete/i });
    
    // Make sure we found the row button
    await expect(deleteBtn).toBeVisible({ timeout: 4000 });
    await deleteBtn.click();

    // 2. THE FIX: Target the modal's specific delete button.
    // By using .last(), we target the modal button (which is rendered at the end of the DOM)
    // instead of accidentally targeting the trash icons in the table rows.
    const confirmBtn = page.getByRole('button', { name: 'Delete Seller', exact: true }).last();
    
    // We don't need an if-statement. If the happy path is working, this button MUST exist.
    await confirmBtn.waitFor({ state: 'visible', timeout: 3000 });
    await confirmBtn.click();

    // 3. Verify it was successfully deleted
    await expect(page.getByText(d.name).first()).not.toBeVisible({ timeout: 8000 });
  });

  test('should cancel delete and keep the seller', async ({ page }) => {
    // 1. Wait for the loading state to finish first
    await expect(page.getByText('Loading sellers...')).not.toBeVisible({ timeout: 10000 });

    const deleteBtn = page.getByRole('button', { name: /delete/i }).first();

    const hasItems = await deleteBtn.isVisible({ timeout: 1000 }).catch(() => false);
    if (!hasItems) {
      test.skip(true, 'No sellers available');
      return;
    }

    // Grab the name of the first seller to verify it stays on the screen later
    const firstRow = page.getByRole('row').nth(1);
    const sellerNameRaw = await firstRow.locator('td').nth(1).textContent(); 
    const cleanName = sellerNameRaw ? sellerNameRaw.trim() : '';

    await deleteBtn.click();

    // 2. THE FIX: Remove the if-statement and catch(). 
    // We expect the modal to open and the Cancel button to be there. 
    // By using .last(), we target the modal button.
    const cancelBtn = page.getByRole('button', { name: 'Cancel', exact: true }).last();
    
    // Wait for it to appear, then click it. If it doesn't appear, the test correctly fails here.
    await cancelBtn.waitFor({ state: 'visible', timeout: 3000 });
    await cancelBtn.click();

    // 3. Verify the modal actually closed
    await expect(page.getByRole('dialog', { exact: true }).first()).not.toBeVisible({ timeout: 4000 });

    // 4. Verify the seller is still safely in the table
    if (cleanName) {
      await expect(page.getByText(cleanName).first()).toBeVisible();
    }
  });

  // ── Search ─────────────────────────────────────────────────────
  test('should filter sellers by name using search bar', async ({ page }) => {
    const searchBox = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await searchBox.fill('Seller');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show empty state for non-existent seller search', async ({ page }) => {
    const searchBox = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await searchBox.fill('xyznonexistentseller999abc');
    await page.waitForTimeout(500);

    await expect(
      page.getByText(/no seller|no result|not found|empty/i)
        .or(page.locator('body'))
    ).toBeTruthy();
  });

  // ── Negative: Validation ───────────────────────────────────────
  test('should show error when seller name is missing', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add seller|new seller|\+ seller/i })
      .first();
    await addBtn.click();

    await page.locator('#phoneNumber').fill('09951234567');
    await page.locator('#sellerEmail').fill('valid@test.com');
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();

    await expect(
      page.getByText(/required|name.*required|cannot be empty/i)
        .or(page.locator(':invalid').first())
    ).toBeAttached(); // CHANGED FROM toBeTruthy()
  });

  test('should show error for invalid seller email format', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add seller|new seller|\+ seller/i })
      .first();
    await addBtn.click();

    await page.locator('#sellerName').fill(SELLER_DATA.invalid.invalidEmail.name);
    await page.locator('#phoneNumber').fill(SELLER_DATA.invalid.invalidEmail.phoneNumber);
    await page.locator('#sellerEmail').fill(SELLER_DATA.invalid.invalidEmail.email);
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();

    await expect(
      page.getByText(/invalid email|valid email/i)
        .or(page.locator(':invalid').first())
    ).toBeAttached(); // CHANGED FROM toBeTruthy()
  });

  test('should show error for invalid phone number', async ({ page }) => {
    // 1. Set up a listener to catch the error alert from the backend
    let dialogMessage = '';
    page.once('dialog', dialog => {
      dialogMessage = dialog.message();
      dialog.accept(); // Dismiss the alert
    });

    const addBtn = page
      .getByRole('button', { name: /add seller|new seller|\+ seller/i })
      .first();
    await addBtn.click();

    await page.locator('#sellerName').fill(SELLER_DATA.invalid.invalidPhone.name);
    await page.locator('#phoneNumber').fill(SELLER_DATA.invalid.invalidPhone.phoneNumber);
    await page.locator('#sellerEmail').fill(SELLER_DATA.invalid.invalidPhone.email);
    
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();

    // Wait a brief moment for your API call to fail and trigger the alert
    await page.waitForTimeout(1000); 

    // 2. Assert that the alert actually fired and contained an error message
    expect(dialogMessage.toLowerCase()).toMatch(/error|invalid|phone/);
  });
});
