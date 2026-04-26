
import { test, expect } from  '@playwright/test';
import {
  ROUTES,
  VALID_USER,
  REGISTER_DATA,
} from '../helpers/testData';

// REGISTER
test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.register);
  });




  test('should display all register form fields', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });

  test('should successfully register with valid credentials', async ({ page }) => {
    const { email, password, confirmPassword } = REGISTER_DATA.valid;

    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(confirmPassword);
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(
      page.getByText(/Registration Successful/i)
    ).toBeVisible({ timeout: 8000 });
  });

  // ── Negative / Validation ───────────────────────────────────────
  test('should show toast error when passwords do not match', async ({ page }) => {
    const { email, password, confirmPassword } = REGISTER_DATA.mismatchPasswords;

    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('#confirmPassword').fill(confirmPassword);
    await page.getByRole('button', { name: /Create Account/i }).click();

    await expect(
      page.getByText(/Passwords do not match/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('should enforce minimum password length of 8 via HTML5 validation', async ({ page }) => {
    await page.locator('#email').fill('test@ridcs.com');
    await page.locator('#password').fill('123');
    await page.locator('#confirmPassword').fill('123');
    await page.getByRole('button', { name: /Create Account/i }).click();

    const isInvalid = await page.locator('#password').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should cap password at 20 characters via maxLength', async ({ page }) => {
    await page.locator('#password').fill('123456789012345678901'); // 21 chars
    const value = await page.locator('#password').inputValue();
    expect(value.length).toBeLessThanOrEqual(20);
  });


  test('should not submit when email field is empty (HTML5 validation)', async ({ page }) => {
    await page.locator('#password').fill('Test@12345');
    await page.locator('#confirmPassword').fill('Test@12345');
    await page.getByRole('button', { name: /Create Account/i }).click();

    const isInvalid = await page.locator('#email').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should not submit when password field is empty (HTML5 validation)', async ({ page }) => {
    await page.locator('#email').fill('test@ridcs.com');
    await page.locator('#confirmPassword').fill('Test@12345');
    await page.getByRole('button', { name: /Create Account/i }).click();

    const isInvalid = await page.locator('#password').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should have a link back to the login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /Sign in here/i }); 
    
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });
});

// ═══════════════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════════════
test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so we always start unauthenticated
    await page.goto(ROUTES.login);
    await page.evaluate(() => localStorage.removeItem('isLoggedIn'));
    await page.goto(ROUTES.login);
  });

  // ── Happy path ─────────────────────────────────────────────────
  test('should display the Welcome Back heading', async ({ page }) => {
    await expect(page.getByText(/Welcome Back/i)).toBeVisible();
  });

  test('should display all login form fields', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Sign in to your account/i })
    ).toBeVisible();
  });


  test('should redirect to dashboard after successful login', async ({ page }) => {
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#password').fill(VALID_USER.password);
    await page.getByRole('button', { name: /Sign in to your account/i }).click();

    // App.jsx has a 3s setTimeout before navigate("/")
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page).toHaveURL('/');
  });

  test('should show Signing in... text while loading', async ({ page }) => {
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#password').fill(VALID_USER.password);
    await page.getByRole('button', { name: /Sign in to your account/i }).click();
    await expect(page.getByText(/Signing in/i).first()).toBeVisible({ timeout: 3000 });
  });

  test('should disable login button while loading', async ({ page }) => {
    await page.locator('#email').fill(VALID_USER.email);
    await page.locator('#password').fill(VALID_USER.password);
    await page.getByRole('button', { name: /Sign in to your account/i }).click();

    const btn = page.getByRole('button').filter({ hasText: /Signing in/i });
    await expect(btn).toBeDisabled({ timeout: 3000 });
  });

  // ── Negative / Validation ───────────────────────────────────────
  test('should show toast error for wrong credentials', async ({ page }) => {
    await page.locator('#email').fill('wrong@ridcs.com');
    await page.locator('#password').fill('WrongPass@123');
    await page.getByRole('button', { name: /Sign in to your account/i }).click();

    await expect(
      page.getByText(/Login failed. Please check your credentials/i)
    ).toBeVisible({ timeout: 8000 });
  });

  test('should not submit when email is empty (HTML5 validation)', async ({ page }) => {
    await page.locator('#password').fill('Test@12345');
    await page.getByRole('button', { name: /Sign in to your account/i }).click();

    const isInvalid = await page.locator('#email').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should not submit when password is empty (HTML5 validation)', async ({ page }) => {
    await page.locator('#email').fill(VALID_USER.email);
    await page.getByRole('button', { name: /Sign in to your account/i }).click();

    const isInvalid = await page.locator('#password').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  // ── Password Visibility Toggle ─────────────────────────────────
  test('password field should mask input by default', async ({ page }) => {
    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  test('should show password as plain text when eye icon is clicked', async ({ page }) => {
    await page.locator('#password').fill('Test@12345');

    // The toggle is a button inside the password field container
    const toggleBtn = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
    await toggleBtn.click();

    await expect(page.locator('#password')).toHaveAttribute('type', 'text');
  });

  test('should re-mask password when eye icon is clicked again', async ({ page }) => {
    await page.locator('#password').fill('Test@12345');

    const toggleBtn = page.locator('button[type="button"]').filter({ has: page.locator('svg') });
    await toggleBtn.click(); // show
    await toggleBtn.click(); // hide again

    await expect(page.locator('#password')).toHaveAttribute('type', 'password');
  });

  // ── Navigation Links ───────────────────────────────────────────
  test('should have a Forgot password? link', async ({ page }) => {
    // Looks for the exact text anywhere on the screen
    const forgotLink = page.getByText('Forgot password?', { exact: true });
    
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(new RegExp(ROUTES.forgotPassword));
  });

  test('should have a Create one now link to Register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /Create one now/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(new RegExp(ROUTES.register));
  });

  // ── Auth guard ─────────────────────────────────────────────────
  test('should redirect to login when accessing / without being logged in', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('isLoggedIn'));
    await page.goto('/');
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });
});

// ═══════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════════
test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.forgotPassword);
  });

  // ── Happy path ─────────────────────────────────────────────────
  test('should display the Forgot Password heading', async ({ page }) => {
    await expect(page.getByText(/Forgot Password/i)).toBeVisible();
  });

  test('should display email input and Send Reset Link button', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Send Reset Link/i })
    ).toBeVisible();
  });



  test('should show loading text while sending reset link', async ({ page }) => {
    await page.locator('#email').fill(VALID_USER.email);
    await page.getByRole('button', { name: /Send Reset Link/i }).click();

    await expect(
      page.getByText(/Sending Reset Link/i)
    ).toBeVisible({ timeout: 3000 });
  });

  // ── Negative / Validation ───────────────────────────────────────
  test('should not submit when email is empty (HTML5 validation)', async ({ page }) => {
    await page.getByRole('button', { name: /Send Reset Link/i }).click();

    const isInvalid = await page.locator('#email').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  test('should not submit for invalid email format (HTML5 validation)', async ({ page }) => {
    await page.locator('#email').fill('notanemail');
    await page.getByRole('button', { name: /Send Reset Link/i }).click();

    const isInvalid = await page.locator('#email').evaluate(
      (el) => !el.validity.valid
    );
    expect(isInvalid).toBeTruthy();
  });

  // ── Navigation ─────────────────────────────────────────────────
  test('should have a Back to Login link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /Back to Login/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });

  test('should have a Sign in here link', async ({ page }) => {
    const signInLink = page.getByRole('link', { name: /Sign in here/i });
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(new RegExp(ROUTES.login));
  });
});
