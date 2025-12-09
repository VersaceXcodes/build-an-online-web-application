import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';
import { useAppStore } from '@/store/main';

/**
 * E2E Authentication Tests
 * 
 * Tests the full authentication flow against the real backend API:
 * 1. Register a new user with a unique email
 * 2. Logout the user
 * 3. Sign in with the registered credentials
 * 
 * These tests use the real API running at VITE_API_BASE_URL (default: http://localhost:3000)
 * and do NOT mock any network calls.
 */

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter initialEntries={['/login']}>
    {children}
  </MemoryRouter>
);

describe('E2E Authentication Flow (Real API)', () => {
  // Use a unique email for each test run to avoid database conflicts
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const testPassword = 'TestPassword123';
  const testFirstName = 'Test';
  const testLastName = 'User';
  const testPhone = '+353861234567';

  beforeEach(() => {
    // Clear localStorage to ensure clean state
    localStorage.clear();
    
    // Reset the Zustand store to initial state
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        auth_token: null,
        current_user: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
    }));
  });

  it('should complete full auth flow: register -> logout -> sign-in', async () => {
    const user = userEvent.setup();

    // ========================================================================
    // STEP 1: REGISTER A NEW USER
    // ========================================================================
    
    render(<App />, { wrapper: Wrapper });

    // Wait for the login page to load and navigate to register
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Kake/i)).toBeInTheDocument();
    });

    // Click on the "Sign up for free" link
    const signUpLink = await screen.findByText(/Sign up for free/i);
    await user.click(signUpLink);

    // Wait for register page to load
    await waitFor(() => {
      expect(screen.getByText(/Create Your Kake Account/i)).toBeInTheDocument();
    });

    // Fill in registration form
    const firstNameInput = await screen.findByLabelText(/First Name/i);
    const lastNameInput = await screen.findByLabelText(/Last Name/i);
    const emailInput = await screen.findByLabelText(/Email Address/i);
    const phoneInput = await screen.findByLabelText(/Phone Number/i);
    const passwordInput = await screen.findByLabelText(/^Password$/i);
    
    await user.type(firstNameInput, testFirstName);
    await user.type(lastNameInput, testLastName);
    await user.type(emailInput, testEmail);
    await user.type(phoneInput, testPhone);
    await user.type(passwordInput, testPassword);

    // Accept terms and conditions
    const termsCheckbox = await screen.findByRole('checkbox', { name: /I agree to the/i });
    await user.click(termsCheckbox);

    // Wait for inputs to be enabled (not loading)
    await waitFor(() => {
      expect(firstNameInput).not.toBeDisabled();
      expect(lastNameInput).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
      expect(phoneInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    // Submit the registration form
    const createAccountButton = await screen.findByRole('button', { name: /Create Account/i });
    await waitFor(() => {
      expect(createAccountButton).not.toBeDisabled();
    });
    await user.click(createAccountButton);

    // Wait for registration to complete and user to be authenticated
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(testEmail);
      },
      { timeout: 20000 }
    );

    console.log('✓ Registration successful');

    // ========================================================================
    // STEP 2: LOGOUT THE USER
    // ========================================================================

    // The user should now be redirected to /account page
    // Wait for the account page to load
    await waitFor(
      () => {
        // Check for navigation or top nav elements indicating logged-in state
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
      },
      { timeout: 10000 }
    );

    // Programmatically logout using the store action
    const logoutUser = useAppStore.getState().logout_user;
    await logoutUser();

    // Wait for logout to complete
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
        expect(state.authentication_state.auth_token).toBeFalsy();
        expect(state.authentication_state.current_user).toBeFalsy();
      },
      { timeout: 10000 }
    );

    console.log('✓ Logout successful');

    // ========================================================================
    // STEP 3: SIGN IN WITH THE REGISTERED CREDENTIALS
    // ========================================================================

    // Re-render the app from the login page
    render(<App />, { wrapper: Wrapper });

    // Wait for login page to load
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Kake/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in to your account to continue/i)).toBeInTheDocument();
    });

    // Find and fill the login form
    const loginEmailInput = await screen.findByLabelText(/Email Address/i);
    const loginPasswordInput = await screen.findByLabelText(/^Password$/i);

    await user.type(loginEmailInput, testEmail);
    await user.type(loginPasswordInput, testPassword);

    // Wait for inputs to be enabled
    await waitFor(() => {
      expect(loginEmailInput).not.toBeDisabled();
      expect(loginPasswordInput).not.toBeDisabled();
    });

    // Submit the login form
    const signInButton = await screen.findByRole('button', { name: /^Sign In$/i });
    await waitFor(() => {
      expect(signInButton).not.toBeDisabled();
    });
    await user.click(signInButton);

    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByText(/Signing in/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Wait for sign-in to complete and user to be authenticated
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(testEmail);
        expect(state.authentication_state.current_user?.first_name).toBe(testFirstName);
        expect(state.authentication_state.current_user?.last_name).toBe(testLastName);
      },
      { timeout: 20000 }
    );

    console.log('✓ Sign-in successful');
    console.log('✓ Full E2E auth flow completed successfully');
  }, 60000); // 60 second timeout for the entire test

  it('should fail login with invalid credentials', async () => {
    const user = userEvent.setup();

    render(<App />, { wrapper: Wrapper });

    // Wait for login page
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Kake/i)).toBeInTheDocument();
    });

    // Try to login with invalid credentials
    const emailInput = await screen.findByLabelText(/Email Address/i);
    const passwordInput = await screen.findByLabelText(/^Password$/i);

    await user.type(emailInput, 'nonexistent@example.com');
    await user.type(passwordInput, 'WrongPassword123');

    const signInButton = await screen.findByRole('button', { name: /^Sign In$/i });
    await user.click(signInButton);

    // Wait for error message to appear
    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.error_message).toBeTruthy();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      },
      { timeout: 10000 }
    );

    console.log('✓ Invalid credentials correctly rejected');
  }, 30000);

  it('should prevent registration with duplicate email', async () => {
    const user = userEvent.setup();

    // First, register a user (reusing the same email from the first test)
    // This test assumes the first test has already run and registered the user
    
    render(<App />, { wrapper: Wrapper });

    // Navigate to register page
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Kake/i)).toBeInTheDocument();
    });

    const signUpLink = await screen.findByText(/Sign up for free/i);
    await user.click(signUpLink);

    // Wait for register page
    await waitFor(() => {
      expect(screen.getByText(/Create Your Kake Account/i)).toBeInTheDocument();
    });

    // Fill form with duplicate email
    const firstNameInput = await screen.findByLabelText(/First Name/i);
    const lastNameInput = await screen.findByLabelText(/Last Name/i);
    const emailInput = await screen.findByLabelText(/Email Address/i);
    const phoneInput = await screen.findByLabelText(/Phone Number/i);
    const passwordInput = await screen.findByLabelText(/^Password$/i);

    await user.type(firstNameInput, 'Another');
    await user.type(lastNameInput, 'User');
    
    // Use an email that's likely to exist (from seed data)
    await user.type(emailInput, 'john.smith@example.com');
    
    await user.type(phoneInput, '+353861111111');
    await user.type(passwordInput, testPassword);

    // Blur the email input to trigger validation
    await user.tab();

    // Wait for email availability check to complete and show error
    await waitFor(
      () => {
        const errorMessage = screen.queryByText(/This email is already registered/i);
        expect(errorMessage).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    console.log('✓ Duplicate email correctly rejected');
  }, 30000);
});
