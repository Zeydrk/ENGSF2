// helpers/testData.js
// Shared test data and utility functions for RIDCS Playwright tests

const BASE_URL = 'http://localhost:5173';

// ─── Auth ────────────────────────────────────────────────────────────────────
const VALID_USER = {
  email: 'admin@ridcs.com',
  password: 'Admin@1234',
};

const INVALID_CREDENTIALS = [
  { email: 'wrong@ridcs.com', password: 'Admin@1234', label: 'wrong email' },
  { email: 'admin@ridcs.com', password: 'wrongpassword', label: 'wrong password' },
  { email: '', password: 'Admin@1234', label: 'empty email' },
  { email: 'admin@ridcs.com', password: '', label: 'empty password' },
  { email: 'notanemail', password: 'Admin@1234', label: 'invalid email format' },
];

const REGISTER_DATA = {
  valid: {
    email: `testuser_${Date.now()}@ridcs.com`,
    password: 'Test@12345',
    confirmPassword: 'Test@12345',
  },
  mismatchPasswords: {
    email: 'mismatch@ridcs.com',
    password: 'Test@12345',
    confirmPassword: 'Different@99',
  },
  weakPassword: {
    email: 'weak@ridcs.com',
    password: '123',
    confirmPassword: '123',
  },
  duplicateEmail: {
    email: 'admin@ridcs.com', // assumed already registered
    password: 'Admin@1234',
    confirmPassword: 'Admin@1234',
  },
};

// ─── Products ────────────────────────────────────────────────────────────────
const PRODUCT_DATA = {
  valid: {
    name: `Test Product ${Date.now()}`,
    expiry: '2027-12-31',
    description: 'A test product created by Playwright',
    stock: '50',
    category: 'Beverages',
    retailPrice: '99.00',
    buyingPrice: '70.00',
  },
  updated: {
    name: `Updated Product ${Date.now()}`,
    stock: '75',
    retailPrice: '110.00',
  },
  invalid: {
    missingName: {
      name: '',
      stock: '10',
      retailPrice: '50.00',
      buyingPrice: '30.00',
    },
    negativeStock: {
      name: 'Bad Stock Product',
      stock: '-5',
      retailPrice: '50.00',
      buyingPrice: '30.00',
    },
    negativePrice: {
      name: 'Bad Price Product',
      stock: '10',
      retailPrice: '-100',
      buyingPrice: '-50',
    },
  },
};

// ─── Sellers ─────────────────────────────────────────────────────────────────
const SELLER_DATA = {
  valid: {
    name: `Seller ${Date.now()}`,
    phoneNumber: '09951234567',
    email: `seller_${Date.now()}@test.com`,
  },
  updated: {
    name: `Updated Seller ${Date.now()}`,
    phoneNumber: '09997654321',
  },
  invalid: {
    missingName: {
      name: '',
      phoneNumber: '09951234567',
      email: 'noseller@test.com',
    },
    invalidEmail: {
      name: 'Bad Email Seller',
      phoneNumber: '09951234567',
      email: 'not-an-email',
    },
    invalidPhone: {
      name: 'Bad Phone Seller',
      phoneNumber: '123',
      email: 'badseller@test.com',
    },
  },
};

// ─── Packages ────────────────────────────────────────────────────────────────
const PACKAGE_DATA = {
  valid: {
    sellerName: 'Juan Dela Cruz',
    packageName: `Package ${Date.now()}`,
    buyerName: 'Maria Santos',
    dropOffDate: '2026-05-15',
    price: '350.00',
    handlingFee: '50.00',
    packageSize: 'Medium',
    paymentMethod: 'Cash',
    status: 'Received',
  },
  updated: {
    buyerName: 'Pedro Reyes',
    price: '400.00',
    status: 'Not Received',
  },
  invalid: {
    missingPackageName: {
      sellerName: 'Juan',
      packageName: '',
      buyerName: 'Maria',
      price: '100',
      packageSize: 'Small',
    },
    missingBuyerName: {
      sellerName: 'Juan',
      packageName: 'Test Package',
      buyerName: '',
      price: '100',
      packageSize: 'Small',
    },
  },
};

// ─── Routes (from App.jsx) ────────────────────────────────────────────────────
const ROUTES = {
  register: '/register',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  landing: '/',
  products: '/product',           // <Route path="/product" ...>
  sellers: '/seller',             // <Route path="/seller" ...>
  packages: '/package',           // <Route path="/package" ...>
  archivedPackages: '/archived-packages', // <Route path="/archived-packages" ...>
};

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Logs in by setting localStorage directly (matching App.jsx auth logic)
 * and navigating to the target page — avoids going through the login UI
 * every time, making tests faster and more reliable.
 */
async function loginAs(page, user = VALID_USER) {
  // Set localStorage to simulate a logged-in session (matches App.jsx handleLogin)
  await page.goto(ROUTES.login);
  await page.evaluate(() => {
    localStorage.setItem('isLoggedIn', 'true');
  });
  await page.goto(ROUTES.landing);
}

/**
 * Logs in via the UI — use this only for login-specific tests.
 */
async function loginViaUI(page, user = VALID_USER) {
  await page.goto(ROUTES.login);
  await page.locator('#email').fill(user.email);
  await page.locator('#password').fill(user.password);
  await page.getByRole('button', { name: /Sign in to your account/i }).click();
  await page.waitForURL('/', { timeout: 10000 });
}

export {
  BASE_URL,
  VALID_USER,
  INVALID_CREDENTIALS,
  REGISTER_DATA,
  PRODUCT_DATA,
  SELLER_DATA,
  PACKAGE_DATA,
  ROUTES,
  loginAs,
  loginViaUI,
};
