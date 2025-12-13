/**
 * Mock Authentication System for MVP Demo
 * 
 * Simulates user authentication without real backend
 * Perfect for demos and prototypes
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const STORAGE_KEY = 'shadowwork_mock_user';

/**
 * Create a mock user session
 */
export function createMockSession(email: string): MockUser {
  const user: MockUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase().trim(),
    name: email.split('@')[0], // Use part before @ as name
    createdAt: new Date().toISOString(),
  };

  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  return user;
}

/**
 * Get current mock user
 */
export function getMockUser(): MockUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Check if user is "logged in"
 */
export function isLoggedIn(): boolean {
  return getMockUser() !== null;
}

/**
 * Logout (clear session)
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

