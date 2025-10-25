// Simple authentication service (no Firebase)
export interface AuthResponse {
  success: boolean;
  message: string;
  account_id?: string;
  user?: any;
}

export class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Simple login with email + password
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Clear logout flag on successful login
      localStorage.removeItem('user_logged_out');
      sessionStorage.removeItem('user_logged_out');

      // Do not store account_id; rely on session cookie only

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout function
  async logout(): Promise<void> {
    try {
      // Set logout flag first to prevent auto-login
      localStorage.setItem('user_logged_out', 'true');
      sessionStorage.setItem('user_logged_out', 'true');

      // Call backend logout to clear server session
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      console.log("✅ Logout completed");

      // Clear all stored session/local data except logout flag
      const logoutFlag = localStorage.getItem('user_logged_out');
      localStorage.clear();
      sessionStorage.clear();
      
      // Restore logout flag
      localStorage.setItem('user_logged_out', 'true');
      sessionStorage.setItem('user_logged_out', 'true');

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      console.log("✅ Complete logout finished");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Even if logout fails, set logout flag and clear local data
      localStorage.setItem('user_logged_out', 'true');
      sessionStorage.setItem('user_logged_out', 'true');
      throw error;
    }
  }

  // Check if user is authenticated
  async checkAuth(): Promise<any> {
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  }

  // Simple demo login for testing
  async demoLogin(): Promise<AuthResponse> {
    return this.login('adicheatsontop@gmail.com', 'password');
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();