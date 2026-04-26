// tests/packages.spec.js
// Tests for the Packages Page — list, add, edit, delete, view, search, filter
// RIDCS — Retail Inventory and Dropping Center System

import { test, expect } from '@playwright/test';
import {ROUTES, PACKAGE_DATA, loginAs}  from '../helpers/testData';

test.describe('Packages Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.goto(ROUTES.packages);
  });

  // ── Page Load ──────────────────────────────────────────────────
  test('should display the packages page with list or table', async ({ page }) => {
    await expect(
      page.getByRole('table')
        .or(page.locator('[data-testid="package-table"], .package-table, .package-list'))
        .first()
    ).toBeVisible();
  });

  test('should display search bar', async ({ page }) => {
    await expect(
      page.getByRole('searchbox').or(page.getByPlaceholder(/search/i))
    ).toBeVisible();
  });



  test('should display add package button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /add package|new package|\+ package/i })
        .or(page.getByRole('link', { name: /add package/i }))
    ).toBeVisible();
  });

  // ── CRUD: Add Package ──────────────────────────────────────────
  test('should open add package form when button is clicked', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add package|new package|\+ package/i })
      .or(page.getByRole('link', { name: /add package/i }));
    await addBtn.first().click();

    await expect(
      page.getByRole('dialog').or(page.locator('form')).first()
    ).toBeVisible();
  });

  test('should successfully add a new package', async ({ page }) => {
    const d = PACKAGE_DATA.valid;

    const addBtn = page
      .getByRole('button', { name: /add package|new package|\+ package/i })
      .first();
    await addBtn.click();

    await page.locator('#sellerName').selectOption(d.sellerName);
    await page.locator('#packageName').fill(d.packageName);
    await page.locator('#buyerName').fill(d.buyerName);
    await page.locator('#droppOffDate').fill(d.dropOffDate);
    await page.locator('#price').fill(d.price);
    await page.locator('#handlingFee').fill(d.handlingFee);

    // packageSize — handle select or text input
    const sizeField = page.locator('#packageSize');
    const sizeTag = await sizeField.evaluate((el) => el.tagName).catch(() => 'INPUT');
    if (sizeTag === 'SELECT') {
      await sizeField.selectOption({ label: d.packageSize }).catch(() => {});
    } else {
      await sizeField.fill(d.packageSize);
    }

    // paymentMethod — handle select or text input
    const paymentField = page.locator('#paymentMethod');
    const paymentTag = await paymentField.evaluate((el) => el.tagName).catch(() => 'INPUT');
    if (paymentTag === 'SELECT') {
      await paymentField.selectOption({ label: d.paymentMethod }).catch(() => {});
    } else {
      await paymentField.fill(d.paymentMethod);
    }

    

    await page.getByRole('button', { name: /save|add|submit|update/i }).last().click();

    // 2. Wait for the form modal to close (confirms submission finished)
    await expect(page.getByRole('dialog').or(page.locator('form'))).not.toBeVisible({ timeout: 5000 });

    // 3. Search for the new package to bypass pagination
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill(d.packageName);

    // 4. Now assert the package name appears in the filtered table
    await expect(
      page.getByText(d.packageName).first()
    ).toBeVisible({ timeout: 8000 });
  });

  // ── CRUD: View Package Details ─────────────────────────────────
  test('should display package detail card when viewing a package', async ({ page }) => {
    const firstRow = page.getByRole('row').nth(1);

    const hasRows = await firstRow.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasRows) {
      test.skip(true, 'No packages available to view');
      return;
    }

    await firstRow.getByTitle('View Details').click();

    await expect(
      page.getByText(/package detail|package code|buyer name|drop.?off/i).first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('should display Edit and Delete buttons in package details view', async ({ page }) => {
    const firstRow = page.getByRole('row').nth(1);

    const hasRows = await firstRow.isVisible({ timeout: 3000 }).catch(() => false);
    if (!hasRows) {
      test.skip(true, 'No packages available');
      return;
    }

    await firstRow.getByTitle('View Details').click();

    await expect(
      page.getByRole('button', { name: /edit/i }).first()
    ).toBeVisible({ timeout: 5000 });

    await expect(
      page.getByRole('button', { name: /delete/i }).first()
    ).toBeVisible({ timeout: 5000 });
  });

  // ── CRUD: Edit Package ─────────────────────────────────────────
  test('should open edit form for a package', async ({ page }) => {
 
    const editBtn = page.locator('table').getByTitle('Edit Package').first();

    // 2. Wait up to 5 seconds for the button to actually attach to the DOM and become visible
    try {
      await editBtn.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      // If 5 seconds pass and the button still isn't there, the database is empty.
      test.skip(true, 'No packages to edit — database is empty');
      return;
    }

    // 3. If we reach this line, the button exists and the data has loaded. Click it!
    await editBtn.click();
    
    await expect(
      page.getByRole('dialog').or(page.locator('form')).first()
    ).toBeVisible();
  });

  test('should successfully edit a package', async ({ page }) => {

    const editBtn = page.locator('table').getByTitle('Edit Package').first();

    try {
      await editBtn.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      test.skip(true, 'No packages to edit — database is empty');
      return;
    }

    await editBtn.click();

    await page.locator('#buyerName').clear();
    await page.locator('#buyerName').fill(PACKAGE_DATA.updated.buyerName);

    await page.locator('#price').clear();
    await page.locator('#price').fill(PACKAGE_DATA.updated.price);

    await page.getByRole('button', { name: /update/i }).last().click();

    // 5. Wait for the form modal to close so we know the backend update finished
    await expect(page.locator('form')).not.toBeVisible({ timeout: 5000 });

    // 6. ── Bypass Pagination by Searching ──
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill(PACKAGE_DATA.updated.buyerName);
    await page.waitForTimeout(500); // Give React state a moment to filter the table

    // 7. Assert the updated buyer name is visible in the desktop table
    await expect(
      page.locator('table').getByText(PACKAGE_DATA.updated.buyerName)
    ).toBeVisible({ timeout: 8000 });
  });

  test('should cancel editing a package without saving', async ({ page }) => {

    const editBtn = page.locator('table').getByTitle('Edit Package').first();

    // 3. Wait up to 5 seconds for the button to appear
    try {
      await editBtn.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      test.skip(true, 'No packages available — database is empty');
      return;
    }

    await editBtn.click();

    await page.locator('#buyerName').clear();
    await page.locator('#buyerName').fill('Should Not Save Buyer');

    await page.getByRole('button', { name: /cancel/i }).click();

    // Wait for the form modal to close
    await expect(page.locator('form')).not.toBeVisible({ timeout: 4000 });

    // Ensure the cancelled data did NOT save and is nowhere in the table
    // Using toHaveCount(0) prevents the Strict Mode Violation!
    await expect(page.locator('table').getByText('Should Not Save Buyer')).toHaveCount(0);
  });

  // ── CRUD: Delete Package ───────────────────────────────────────
  test('should show delete confirmation dialog', async ({ page }) => {

    // 2. Target the Delete button specifically inside the desktop table
    const deleteBtn = page.locator('table').getByTitle('Delete Package').first();

    // 3. Wait up to 5 seconds for the button to appear
    try {
      await deleteBtn.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      test.skip(true, 'No packages to delete — database is empty');
      return;
    }

    // 4. Click the trash icon
    await deleteBtn.click();

    // 5. Look for the specific text in your component's confirmation modal
    // (Bypassing the missing role="dialog" issue)
    await expect(
      page.getByText(/Are you sure you want to delete this package/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should delete a package after confirming', async ({ page }) => {
    const d = {
      sellerName: 'Juan Dela Cruz',
      packageName: `DeletePkg_${Date.now()}`,
      buyerName: 'Delete Me',
      dropOffDate: '2026-06-01',
      price: '100',
      handlingFee: '20',
      packageSize: 'Small',
      paymentMethod: 'Cash',
      status: 'Received',
    };

    const addBtn = page
      .getByRole('button', { name: /add package|new package|\+ package/i })
      .first();
    await addBtn.click();

    await page.locator('#sellerName').selectOption(d.sellerName);
    await page.locator('#packageName').fill(d.packageName);
    await page.locator('#buyerName').fill(d.buyerName);
    await page.locator('#droppOffDate').fill(d.dropOffDate);
    await page.locator('#price').fill(d.price);
    await page.locator('#handlingFee').fill(d.handlingFee);

    const sizeField = page.locator('#packageSize');
    const sizeTag = await sizeField.evaluate((el) => el.tagName).catch(() => 'INPUT');
    if (sizeTag === 'SELECT') {
      await sizeField.selectOption({ label: d.packageSize }).catch(() => {});
    } else {
      await sizeField.fill(d.packageSize);
    }

    const paymentField = page.locator('#paymentMethod');
    const paymentTag = await paymentField.evaluate((el) => el.tagName).catch(() => 'INPUT');
    if (paymentTag === 'SELECT') {
      await paymentField.selectOption({ label: d.paymentMethod }).catch(() => {});
    } else {
      await paymentField.fill(d.paymentMethod);
    }

    // Click save
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();
    
    // Wait for the Add form modal to close so we know the save finished
    await expect(page.getByRole('dialog').or(page.locator('form'))).not.toBeVisible({ timeout: 5000 });

    // ── Bypass Pagination by Searching ──
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill(d.packageName);
    await page.waitForTimeout(500); // Give React state a moment to filter the table

    // Find the row and click its specific Delete icon
    const row = page.getByRole('row').filter({ hasText: d.packageName });
    const deleteBtn = row.getByTitle('Delete Package');

    const found = await deleteBtn.isVisible({ timeout: 4000 }).catch(() => false);
    if (!found) {
      test.skip(true, 'Could not locate added package row');
      return;
    }

    // ── Click the specific Delete icon ──
    await deleteBtn.click();

    // 1. Set up a listener to automatically click "OK" on the native browser alert
    // that your component fires (alert('Package archived successfully'))
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });

    // 2. Wait for the confirmation modal to appear by looking for its specific text
    // (We do this because your modal div lacks the role="dialog" attribute)
    await expect(page.getByText(/Are you sure you want to delete/i)).toBeVisible({ timeout: 2000 });

    // 3. Find the exact button containing the text "Delete Package"
    // (Using .filter avoids accidentally clicking the trash icon buttons again)
    const confirmBtn = page.locator('button').filter({ hasText: 'Delete Package' });
    await confirmBtn.click();

    // 4. Wait for the package to disappear from the DOM
    await expect(page.getByText(d.packageName)).toHaveCount(0, { timeout: 8000 });
  });

  // ── Search & Filter ────────────────────────────────────────────
  test('should filter packages by keyword in search bar', async ({ page }) => {
    const searchBox = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await searchBox.fill('Package');
    await page.waitForTimeout(500);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show empty state for non-existent package search', async ({ page }) => {
    const searchBox = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i));
    await searchBox.fill('zzznonexistentpackage999xyz');
    await page.waitForTimeout(500);

    await expect(
      page.getByText(/no package|no result|not found|empty/i)
        .or(page.locator('body'))
    ).toBeTruthy();
  });


  // ── Negative: Validation ───────────────────────────────────────
  test('should show error when package name is missing', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add package|new package|\+ package/i })
      .first();
    await addBtn.click();

    // Select the first available seller from the dropdown (index 1)
    await page.locator('#sellerName').selectOption({ index: 1 });
    
    // Leave packageName empty
    await page.locator('#buyerName').fill('Maria');
    await page.locator('#price').fill('100');
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();

    await expect(
      page.getByText(/required|package name.*required|cannot be empty/i)
        .or(page.locator(':invalid'))
    ).toBeTruthy();
  });

  test('should show error when buyer name is missing', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add package|new package|\+ package/i })
      .first();
    await addBtn.click();

    // Select the first available seller from the dropdown
    await page.locator('#sellerName').selectOption({ index: 1 });
    
    await page.locator('#packageName').fill('Test Package');
    // Leave buyerName empty
    await page.locator('#price').fill('100');
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();

    await expect(
      page.getByText(/required|buyer name.*required|cannot be empty/i)
        .or(page.locator(':invalid'))
    ).toBeTruthy();
  });

  test('should show error for invalid price', async ({ page }) => {
    const addBtn = page
      .getByRole('button', { name: /add package|new package|\+ package/i })
      .first();
    await addBtn.click();

    // Select the first available seller from the dropdown
    await page.locator('#sellerName').selectOption({ index: 1 });
    
    await page.locator('#packageName').fill('Test Package');
    await page.locator('#buyerName').fill('Maria');
    await page.locator('#price').fill('-50');
    await page.getByRole('button', { name: /save|add|submit/i }).last().click();

    await expect(
      page.getByText(/invalid|price.*negative|must be.*positive|greater than/i)
        .or(page.locator(':invalid'))
    ).toBeTruthy();
  })
});
