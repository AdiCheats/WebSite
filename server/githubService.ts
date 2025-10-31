import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const DATA_FILE = process.env.DATA_FILE || "";
const BASE_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${DATA_FILE}`;

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  passwordHash?: string; // optional hashed password for login
}

export interface Application {
  id: number;
  userId: string;
  name: string;
  description: string | null;
  apiKey: string;
  isActive: boolean;
  version: string | null;
  versionMismatchMessage: string | null;
  loginSuccessMessage: string | null;
  loginFailedMessage: string | null;
  accountDisabledMessage: string | null;
  accountExpiredMessage: string | null;
  hwidMismatchMessage: string | null;
  hwidLockEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppUser {
  id: number;
  applicationId: number;
  username: string;
  password: string;
  hwid: string | null;
  hwidLockEnabled: boolean;  // Per-user HWID lock setting
  licenseKey: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  isPaused: boolean;
  isBanned: boolean;
  ip: string | null;
  loginAttempts: number;
  lastLogin: Date | null;
  lastLoginAttempt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseKey {
  id: number;
  applicationId: number;
  licenseKey: string;
  maxUsers: number;
  currentUsers: number;
  validityDays: number;
  expiresAt: Date;
  description: string | null;
  isActive: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: number;
  applicationId: number;
  name: string;
  description: string;
  maxUsers: number;
  currentUsers: number;
  validityDays: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomMessages {
  loginSuccess: string;
  loginFailed: string;
  accountDisabled: string;
  accountExpired: string;
  versionMismatch: string;
  hwidMismatch: string;
}

export const DEFAULT_MESSAGES: CustomMessages = {
  loginSuccess: "Login successful! Welcome back.",
  loginFailed: "Invalid username or password. Please try again.",
  accountDisabled: "Your account has been disabled. Please contact support.",
  accountExpired: "Your account has expired. Please renew your subscription.",
  versionMismatch: "Your application version is outdated. Please update to continue.",
  hwidMismatch: "Hardware ID mismatch detected. Please contact support for assistance."
};

export interface Webhook {
  id: number;
  userId: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlacklistEntry {
  id: number;
  applicationId: number | null;
  type: 'ip' | 'username' | 'hwid';
  value: string;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: number;
  applicationId: number;
  appUserId: number | null;
  event: string;
  success: boolean;
  errorMessage: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: Date;
}

export interface ActiveSession {
  id: number;
  applicationId: number;
  appUserId: number;
  sessionToken: string;
  ipAddress: string | null;
  userAgent: string | null;
  location: string | null;
  hwid: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// GitHub Data Structure
interface GitHubData {
  admin: any[]; // Users array (like Discord bot)
  licenses: any[]; // License keys array (like Discord bot)
  users: User[];
  applications: Application[];
  appUsers: AppUser[];
  licenseKeys: LicenseKey[];
  subscriptions: Subscription[]; // Application subscriptions
  webhooks: Webhook[];
  blacklistEntries: BlacklistEntry[];
  activityLogs: ActivityLog[];
  activeSessions: ActiveSession[];
  credits: Record<string, number>; // Credits system (like Discord bot)
  owner_id: number | null; // Owner ID (like Discord bot)
  customMessages: CustomMessages; // Custom authentication messages
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

class GitHubService {
  private async getGitHubFile(): Promise<{ data: GitHubData; sha: string | null }> {
    const headers = {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "phantom-auth-github-service"
    };

    try {
      const response = await fetch(BASE_URL, { headers });
      
      if (response.status === 404) {
        // Initialize a fresh structure when the file doesn't exist yet (similar to Discord bot)
        const initialData: GitHubData = {
          admin: [], // Users array (like Discord bot)
          licenses: [], // License keys array (like Discord bot)
          users: [], // Users array
          applications: [], // Applications array
          appUsers: [], // App users array
          licenseKeys: [], // Legacy license keys
          subscriptions: [], // Application subscriptions
          webhooks: [], // Webhooks
          blacklistEntries: [], // Blacklist
          activityLogs: [], // Activity logs
          activeSessions: [], // Active sessions
          credits: {}, // Credits system (like Discord bot)
          owner_id: null, // Owner ID (like Discord bot)
          customMessages: DEFAULT_MESSAGES, // Default custom messages
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0"
          }
        };
        return { data: initialData, sha: null };
      }

      if (response.status !== 200) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const githubData = await response.json();
      
      let contentText: string;
      if (githubData.encoding === "base64") {
        const decoded = Buffer.from(githubData.content, 'base64').toString('utf-8');
        contentText = decoded;
      } else if (githubData.download_url) {
        const rawResponse = await fetch(githubData.download_url, {
          headers: { "User-Agent": "phantom-auth-github-service" }
        });
        if (rawResponse.status !== 200) {
          throw new Error(`Failed to fetch raw content: ${rawResponse.status}`);
        }
        contentText = await rawResponse.text();
      } else {
        throw new Error("No content available");
      }

      const parsedData = JSON.parse(contentText || JSON.stringify({
        admin: [],
        licenses: [],
        users: [],
        applications: [],
        appUsers: [],
        licenseKeys: [],
        subscriptions: [],
        webhooks: [],
        blacklistEntries: [],
        activityLogs: [],
        activeSessions: [],
        credits: {},
        owner_id: null,
        customMessages: DEFAULT_MESSAGES,
        metadata: {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        }
      }));
      
      // Ensure all arrays are properly initialized with robust checks
      const data: GitHubData = {
        admin: Array.isArray(parsedData.admin) ? parsedData.admin : [],
        licenses: Array.isArray(parsedData.licenses) ? parsedData.licenses : [],
        users: Array.isArray(parsedData.users) ? parsedData.users : [],
        applications: Array.isArray(parsedData.applications) ? parsedData.applications : [],
        appUsers: Array.isArray(parsedData.appUsers) ? parsedData.appUsers : [],
        licenseKeys: Array.isArray(parsedData.licenseKeys) ? parsedData.licenseKeys : [],
        subscriptions: Array.isArray(parsedData.subscriptions) ? parsedData.subscriptions : [],
        webhooks: Array.isArray(parsedData.webhooks) ? parsedData.webhooks : [],
        blacklistEntries: Array.isArray(parsedData.blacklistEntries) ? parsedData.blacklistEntries : [],
        activityLogs: Array.isArray(parsedData.activityLogs) ? parsedData.activityLogs : [],
        activeSessions: Array.isArray(parsedData.activeSessions) ? parsedData.activeSessions : [],
        credits: parsedData.credits || {},
        owner_id: parsedData.owner_id || null,
        customMessages: parsedData.customMessages || DEFAULT_MESSAGES,
        metadata: parsedData.metadata || {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        }
      };
      
      // Additional safety check - ensure all arrays are actually arrays
      console.log('GitHub data initialization check:', {
        admin: Array.isArray(data.admin),
        licenses: Array.isArray(data.licenses),
        users: Array.isArray(data.users),
        applications: Array.isArray(data.applications),
        appUsers: Array.isArray(data.appUsers),
        licenseKeys: Array.isArray(data.licenseKeys),
        subscriptions: Array.isArray(data.subscriptions),
        webhooks: Array.isArray(data.webhooks),
        blacklistEntries: Array.isArray(data.blacklistEntries),
        activityLogs: Array.isArray(data.activityLogs),
        activeSessions: Array.isArray(data.activeSessions)
      });
      
      // Force reinitialize any corrupted arrays
      if (!Array.isArray(data.appUsers)) {
        console.log('Force reinitializing appUsers array');
        data.appUsers = [];
      }
      if (!Array.isArray(data.subscriptions)) {
        console.log('Force reinitializing subscriptions array');
        data.subscriptions = [];
      }
      if (!Array.isArray(data.activityLogs)) {
        console.log('Force reinitializing activityLogs array');
        data.activityLogs = [];
      }
      if (!Array.isArray(data.activeSessions)) {
        console.log('Force reinitializing activeSessions array');
        data.activeSessions = [];
      }
      
      return { data, sha: githubData.sha };
    } catch (error) {
      console.error("Error fetching GitHub file:", error);
      throw error;
    }
  }

  private async updateGitHubFile(data: GitHubData, sha: string | null, message: string): Promise<boolean> {
    const headers = {
      "Authorization": `token ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "phantom-auth-github-service"
    };

    try {
      // Ensure metadata exists
      if (!data.metadata) {
        data.metadata = {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        };
      } else {
        data.metadata.lastUpdated = new Date().toISOString();
      }
      
      const content = JSON.stringify(data, null, 2);
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

      const payload: any = {
        message,
        content: encodedContent
      };

      if (sha) {
        payload.sha = sha;
      }

      const response = await fetch(BASE_URL, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("Error updating GitHub file:", error);
      return false;
    }
  }

  // User Management
  async getUser(userId: string): Promise<User | null> {
    const { data } = await this.getGitHubFile();
    return data.users?.find(u => u.id === userId) || null;
  }

  async getAllUsers(): Promise<User[]> {
    const { data } = await this.getGitHubFile();
    return data.users || [];
  }

  async upsertUser(userData: Partial<User>): Promise<User> {
    const { data, sha } = await this.getGitHubFile();
    
    // Ensure users array exists
    if (!data.users) {
      data.users = [];
    }
    
    const existingUserIndex = data.users.findIndex(u => u.id === userData.id);
    const now = new Date();
    
    if (existingUserIndex >= 0) {
      // Update existing user
      data.users[existingUserIndex] = {
        ...data.users[existingUserIndex],
        ...userData,
        updatedAt: now
      } as User;
    } else {
      // Create new user
      const newUser: User = {
        id: userData.id || nanoid(),
        email: userData.email || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        profileImageUrl: userData.profileImageUrl || null,
        role: userData.role || 'user',
        permissions: userData.permissions || [],
        isActive: userData.isActive ?? true,
        createdAt: now,
        updatedAt: now
      };
      data.users.push(newUser);
    }

    const success = await this.updateGitHubFile(data, sha, `Update user: ${userData.id || 'new'}`);
    if (!success) {
      throw new Error("Failed to update user in GitHub");
    }

    return data.users.find(u => u.id === (userData.id || data.users[data.users.length - 1].id))!;
  }

  // Initialize test data for development
  async initializeTestData(): Promise<void> {
    const { data, sha } = await this.getGitHubFile();
    
    // Ensure all arrays exist
    if (!data.users) data.users = [];
    if (!data.applications) data.applications = [];
    if (!data.appUsers) data.appUsers = [];
    if (!data.licenseKeys) data.licenseKeys = [];
    if (!data.webhooks) data.webhooks = [];
    if (!data.blacklistEntries) data.blacklistEntries = [];
    if (!data.activityLogs) data.activityLogs = [];
    if (!data.activeSessions) data.activeSessions = [];
    
    // Add test user if not exists
    const testUserExists = data.users.some(u => u.email === 'adicheatsontop@gmail.com');
    if (!testUserExists) {
      const now = new Date();
      const testUser: User = {
        id: 'adicheatsontop@gmail.com',
        email: 'adicheatsontop@gmail.com',
        firstName: 'Adi',
        lastName: 'Cheats',
        profileImageUrl: null,
        role: 'admin',
        permissions: ['admin'],
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      data.users.push(testUser);
      
      // Update the file on GitHub
      const success = await this.updateGitHubFile(data, sha, 'Initialize test user');
      if (success) {
        console.log('Test user initialized successfully');
      }
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return null;
    }

    data.users[userIndex] = {
      ...data.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    const success = await this.updateGitHubFile(data, sha, `Update user: ${userId}`);
    if (!success) {
      throw new Error("Failed to update user in GitHub");
    }

    return data.users[userIndex];
  }

  async createUserWithCredentials(payload: { email: string; password: string; role?: string; firstName?: string; lastName?: string; permissions?: string[]; isActive?: boolean; }): Promise<User> {
    const { data, sha } = await this.getGitHubFile();
    const now = new Date();
    const passwordHash = await bcrypt.hash(payload.password, 10);
    if (!Array.isArray(data.users)) {
      data.users = [];
    }
    const idx = data.users.findIndex(u => u.id === payload.email);
    if (idx >= 0) {
      // update existing
      data.users[idx] = {
        ...data.users[idx],
        email: payload.email,
        firstName: payload.firstName ?? data.users[idx].firstName ?? '',
        lastName: payload.lastName ?? data.users[idx].lastName ?? '',
        role: payload.role ?? data.users[idx].role ?? 'user',
        permissions: payload.permissions ?? data.users[idx].permissions ?? [],
        isActive: payload.isActive ?? (data.users[idx].isActive ?? true),
        passwordHash,
        updatedAt: now
      } as User;
    } else {
      const newUser: User = {
        id: payload.email,
        email: payload.email,
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        profileImageUrl: null,
        role: payload.role || 'user',
        permissions: payload.permissions || [],
        isActive: payload.isActive ?? true,
        createdAt: now,
        updatedAt: now,
        passwordHash
      };
      data.users.push(newUser);
    }

    const success = await this.updateGitHubFile(data, sha, `Create/Update user credentials: ${payload.email}`);
    if (!success) {
      throw new Error('Failed to persist user to GitHub');
    }
    return data.users.find(u => u.id === payload.email)!;
  }

  async setUserPassword(userId: string, newPassword: string): Promise<User | null> {
    const { data, sha } = await this.getGitHubFile();
    const idx = data.users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    (data.users[idx] as any).passwordHash = passwordHash;
    (data.users[idx] as any).updatedAt = new Date();
    const success = await this.updateGitHubFile(data, sha, `Update user password: ${userId}`);
    if (!success) return null;
    return data.users[idx];
  }

  async deleteUser(userId: string): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return false;
    }

    data.users.splice(userIndex, 1);

    const success = await this.updateGitHubFile(data, sha, `Delete user: ${userId}`);
    return success;
  }

  // Application Management
  async getAllApplications(userId?: string): Promise<Application[]> {
    const { data } = await this.getGitHubFile();
    const apps = data.applications || [];
    if (userId) {
      return apps.filter(app => app.userId === userId);
    }
    return apps;
  }

  async getApplication(applicationId: number): Promise<Application | null> {
    const { data } = await this.getGitHubFile();
    return (data.applications || []).find(app => app.id === applicationId) || null;
  }

  async createApplication(userId: string, appData: any): Promise<Application> {
    const { data, sha } = await this.getGitHubFile();
    
    const newApp: Application = {
      id: Date.now(), // Simple ID generation
      userId,
      name: appData.name,
      description: appData.description || null,
      apiKey: nanoid(32),
      isActive: appData.isActive ?? true,
      version: appData.version || "1.0", // Set default version to 1.0
      versionMismatchMessage: appData.versionMismatchMessage || null,
      loginSuccessMessage: appData.loginSuccessMessage || null,
      loginFailedMessage: appData.loginFailedMessage || null,
      accountDisabledMessage: appData.accountDisabledMessage || null,
      accountExpiredMessage: appData.accountExpiredMessage || null,
      hwidMismatchMessage: appData.hwidMismatchMessage || null,
      hwidLockEnabled: appData.hwidLockEnabled ?? true, // Set HWID lock enabled to true by default
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ensure applications array exists
    if (!data.applications) {
      data.applications = [];
    }
    data.applications.push(newApp);

    // Create default subscription like Discord bot
    const defaultSubscription: Subscription = {
      id: Date.now() + 1,
      applicationId: newApp.id,
      name: "aimkillapk", // Default subscription name like Discord bot
      description: `Default subscription for ${newApp.name}`,
      maxUsers: 1000,
      currentUsers: 0,
      validityDays: 365,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ensure subscriptions array exists
    if (!Array.isArray(data.subscriptions)) {
      data.subscriptions = [];
    }
    data.subscriptions.push(defaultSubscription);

    const success = await this.updateGitHubFile(data, sha, `Create application: ${newApp.name} with default subscription`);
    if (!success) {
      throw new Error("Failed to create application in GitHub");
    }

    return newApp;
  }

  async updateApplication(applicationId: number, updates: any): Promise<Application | null> {
    const { data, sha } = await this.getGitHubFile();
    
    const appIndex = data.applications.findIndex(app => app.id === applicationId);
    if (appIndex === -1) {
      return null;
    }

    data.applications[appIndex] = {
      ...data.applications[appIndex],
      ...updates,
      updatedAt: new Date()
    };

    const success = await this.updateGitHubFile(data, sha, `Update application: ${data.applications[appIndex].name}`);
    if (!success) {
      throw new Error("Failed to update application in GitHub");
    }

    return data.applications[appIndex];
  }

  async deleteApplication(applicationId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const appIndex = data.applications.findIndex(app => app.id === applicationId);
    if (appIndex === -1) {
      return false;
    }

    const applicationName = data.applications[appIndex].name;

    // Cascade delete: Remove all users associated with this application
    if (Array.isArray(data.appUsers)) {
      data.appUsers = data.appUsers.filter(user => user.applicationId !== applicationId);
    }

    // Cascade delete: Remove all subscriptions associated with this application
    if (Array.isArray(data.subscriptions)) {
      data.subscriptions = data.subscriptions.filter(sub => sub.applicationId !== applicationId);
    }

    // Cascade delete: Remove all license keys associated with this application
    if (Array.isArray(data.licenseKeys)) {
      data.licenseKeys = data.licenseKeys.filter(key => key.applicationId !== applicationId);
    }

    // Cascade delete: Remove all webhooks associated with this application's user
    if (Array.isArray(data.webhooks)) {
      const application = data.applications[appIndex];
      if (application) {
        data.webhooks = data.webhooks.filter(webhook => webhook.userId !== application.userId);
      }
    }

    // Cascade delete: Remove all activity logs associated with this application
    if (Array.isArray(data.activityLogs)) {
      data.activityLogs = data.activityLogs.filter(log => log.applicationId !== applicationId);
    }

    // Cascade delete: Remove all active sessions associated with this application
    if (Array.isArray(data.activeSessions)) {
      data.activeSessions = data.activeSessions.filter(session => session.applicationId !== applicationId);
    }

    // Remove the application itself
    data.applications.splice(appIndex, 1);

    const success = await this.updateGitHubFile(data, sha, `Delete application: ${applicationName} (ID: ${applicationId}) with cascade delete`);
    return success;
  }

  async getApplicationByApiKey(apiKey: string): Promise<Application | null> {
    const { data } = await this.getGitHubFile();
    return (data.applications || []).find(app => app.apiKey === apiKey) || null;
  }

  // App User Management
  async getAllAppUsers(applicationId: number): Promise<AppUser[]> {
    const { data } = await this.getGitHubFile();
    return (data.appUsers || []).filter(user => user.applicationId === applicationId);
  }

  async getAppUser(userId: number): Promise<AppUser | null> {
    const { data } = await this.getGitHubFile();
    return (data.appUsers || []).find(user => user.id === userId) || null;
  }

  async getAppUserByUsername(applicationId: number, username: string): Promise<AppUser | null> {
    const { data } = await this.getGitHubFile();
    return (data.appUsers || []).find(user => 
      user.applicationId === applicationId && user.username === username
    ) || null;
  }

  async getAppUserByEmail(applicationId: number, email: string): Promise<AppUser | null> {
    // Email functionality removed from AppUser interface
    // This method is kept for backward compatibility but always returns null
    return null;
  }

  async createAppUser(applicationId: number, userData: any): Promise<AppUser> {
    const { data, sha } = await this.getGitHubFile();
    
    console.log('GitHub data structure:', JSON.stringify(data, null, 2));
    console.log('data.subscriptions type:', typeof data.subscriptions, 'isArray:', Array.isArray(data.subscriptions));
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Ensure all required arrays exist with proper type checking
    if (!Array.isArray(data.subscriptions)) {
      console.log('Initializing subscriptions array');
      data.subscriptions = [];
    }
    if (!Array.isArray(data.appUsers)) {
      console.log('Initializing appUsers array');
      data.appUsers = [];
    }
    
    // Find the default subscription for this application
    let defaultSubscription = null;
    if (Array.isArray(data.subscriptions)) {
      defaultSubscription = data.subscriptions.find(sub => 
        sub.applicationId === applicationId && sub.name === "aimkillapk"
      );
    }
    
    const newUser: AppUser = {
      id: Date.now(),
      applicationId,
      username: userData.username,
      password: hashedPassword,
      hwid: userData.hwid || null,
      hwidLockEnabled: userData.hwidLockEnabled ?? false,  // Default to false if not specified
      licenseKey: userData.licenseKey || null,
      expiresAt: userData.expiresAt ? new Date(userData.expiresAt) : (defaultSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null), // Default 30 days if subscription exists
      isActive: userData.isActive ?? true,
      isPaused: userData.isPaused ?? false,
      isBanned: false,
      ip: userData.ip || null,
      loginAttempts: 0,
      lastLogin: null,
      lastLoginAttempt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ensure appUsers array exists
    if (!data.appUsers) {
      data.appUsers = [];
    }
    data.appUsers.push(newUser);

    // Update subscription current users count
    if (defaultSubscription) {
      defaultSubscription.currentUsers = (defaultSubscription.currentUsers || 0) + 1;
    }

    const success = await this.updateGitHubFile(data, sha, `Create app user: ${newUser.username} under subscription`);
    if (!success) {
      throw new Error("Failed to create app user in GitHub");
    }

    return newUser;
  }

  async createAppUserWithLicense(applicationId: number, userData: any): Promise<AppUser> {
    // First create the user
    const user = await this.createAppUser(applicationId, userData);
    
    // Then update the license key usage
    if (userData.licenseKey) {
      await this.updateLicenseKeyUsage(userData.licenseKey, 1);
    }
    
    return user;
  }


  async deleteAppUser(userId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    (data.appUsers || []).splice(userIndex, 1);

    const success = await this.updateGitHubFile(data, sha, `Delete app user: ${userId}`);
    return success;
  }

  async pauseAppUser(userId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    (data.appUsers || [])[userIndex].isPaused = true;
    (data.appUsers || [])[userIndex].isActive = false; // Set isActive to false when pausing
    (data.appUsers || [])[userIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Pause app user: ${(data.appUsers || [])[userIndex].username}`);
    return success;
  }

  async unpauseAppUser(userId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    (data.appUsers || [])[userIndex].isPaused = false;
    (data.appUsers || [])[userIndex].isActive = true; // Set isActive to true when unpausing
    (data.appUsers || [])[userIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Unpause app user: ${(data.appUsers || [])[userIndex].username}`);
    return success;
  }

  async resetAppUserHwid(userId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    (data.appUsers || [])[userIndex].hwid = null;
    (data.appUsers || [])[userIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Reset HWID for app user: ${(data.appUsers || [])[userIndex].username}`);
    return success;
  }

  async banAppUser(userId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    (data.appUsers || [])[userIndex].isBanned = true;
    (data.appUsers || [])[userIndex].isActive = false; // Set isActive to false when banning
    (data.appUsers || [])[userIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Ban app user: ${(data.appUsers || [])[userIndex].username}`);
    return success;
  }

  async unbanAppUser(userId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    (data.appUsers || [])[userIndex].isBanned = false;
    (data.appUsers || [])[userIndex].isActive = true; // Set isActive to true when unbanning
    (data.appUsers || [])[userIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Unban app user: ${(data.appUsers || [])[userIndex].username}`);
    return success;
  }

  async updateAppUser(userId: number, userData: Partial<AppUser>): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const userIndex = (data.appUsers || []).findIndex(user => user.id === userId);
    if (userIndex === -1) {
      return false;
    }

    // Hash password if it's being updated
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Update user data
    Object.assign((data.appUsers || [])[userIndex], userData);
    (data.appUsers || [])[userIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Update app user: ${(data.appUsers || [])[userIndex].username}`);
    return success;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // License Key Management
  async getAllLicenseKeys(applicationId: number): Promise<LicenseKey[]> {
    const { data } = await this.getGitHubFile();
    return (data.licenseKeys || []).filter(license => license.applicationId === applicationId);
  }

  async getLicenseKey(licenseId: number): Promise<LicenseKey | null> {
    const { data } = await this.getGitHubFile();
    return (data.licenseKeys || []).find(license => license.id === licenseId) || null;
  }

  async getLicenseKeyByKey(licenseKey: string): Promise<LicenseKey | null> {
    const { data } = await this.getGitHubFile();
    return (data.licenseKeys || []).find(license => license.licenseKey === licenseKey) || null;
  }

  async createLicenseKey(applicationId: number, licenseData: any): Promise<LicenseKey> {
    const { data, sha } = await this.getGitHubFile();
    
    const newLicense: LicenseKey = {
      id: Date.now(),
      applicationId,
      licenseKey: licenseData.licenseKey || nanoid(32),
      maxUsers: licenseData.maxUsers || 1,
      currentUsers: 0,
      validityDays: licenseData.validityDays || 30,
      expiresAt: new Date(Date.now() + (licenseData.validityDays || 30) * 24 * 60 * 60 * 1000),
      description: licenseData.description || null,
      isActive: licenseData.isActive ?? true,
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ensure licenseKeys array exists
    if (!data.licenseKeys) {
      data.licenseKeys = [];
    }
    data.licenseKeys.push(newLicense);

    const success = await this.updateGitHubFile(data, sha, `Create license key: ${newLicense.licenseKey}`);
    if (!success) {
      throw new Error("Failed to create license key in GitHub");
    }

    return newLicense;
  }

  async deleteLicenseKey(licenseId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const licenseIndex = (data.licenseKeys || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    (data.licenseKeys || []).splice(licenseIndex, 1);

    const success = await this.updateGitHubFile(data, sha, `Delete license key: ${licenseId}`);
    return success;
  }

  async updateLicenseStatus(licenseId: number, updates: Partial<Pick<LicenseKey, 'isActive' | 'isBanned' | 'expiresAt' | 'validityDays'>>): Promise<LicenseKey | null> {
    const { data, sha } = await this.getGitHubFile();
    const index = (data.licenseKeys || []).findIndex((l: any) => l.id === licenseId);
    if (index === -1) return null;
    const target = (data.licenseKeys || [])[index];
    if (updates.isActive !== undefined) target.isActive = updates.isActive;
    if (updates.isBanned !== undefined) target.isBanned = updates.isBanned;
    if (updates.validityDays !== undefined) target.validityDays = updates.validityDays;
    if (updates.expiresAt !== undefined) target.expiresAt = new Date(updates.expiresAt as any);
    target.updatedAt = new Date();
    const success = await this.updateGitHubFile(data, sha, `Update license ${licenseId}`);
    return success ? target : null;
  }

  async validateLicenseKey(licenseKey: string, applicationId: number): Promise<LicenseKey | null> {
    const { data } = await this.getGitHubFile();
    
    const license = (data.licenseKeys || []).find(l => 
      l.licenseKey === licenseKey && 
      l.applicationId === applicationId && 
      l.isActive &&
      new Date() < l.expiresAt
    );

    return license || null;
  }

  async updateLicenseKeyUsage(licenseKey: string, increment: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const licenseIndex = (data.licenseKeys || []).findIndex(license => license.licenseKey === licenseKey);
    if (licenseIndex === -1) {
      return false;
    }

    (data.licenseKeys || [])[licenseIndex].currentUsers += increment;
    (data.licenseKeys || [])[licenseIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Update license key usage: ${licenseKey}`);
    return success;
  }

  // Webhook Management
  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    const { data } = await this.getGitHubFile();
    return data.webhooks.filter(webhook => webhook.userId === userId);
  }

  async createWebhook(userId: string, webhookData: any): Promise<Webhook> {
    const { data, sha } = await this.getGitHubFile();
    
    const newWebhook: Webhook = {
      id: Date.now(),
      userId,
      url: webhookData.url,
      events: webhookData.events || [],
      isActive: webhookData.isActive ?? true,
      secret: webhookData.secret || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    data.webhooks.push(newWebhook);

    const success = await this.updateGitHubFile(data, sha, `Create webhook: ${newWebhook.url}`);
    if (!success) {
      throw new Error("Failed to create webhook in GitHub");
    }

    return newWebhook;
  }

  async updateWebhook(webhookId: number, updates: any): Promise<Webhook | null> {
    const { data, sha } = await this.getGitHubFile();
    
    const webhookIndex = data.webhooks.findIndex(webhook => webhook.id === webhookId);
    if (webhookIndex === -1) {
      return null;
    }

    data.webhooks[webhookIndex] = {
      ...data.webhooks[webhookIndex],
      ...updates,
      updatedAt: new Date()
    };

    const success = await this.updateGitHubFile(data, sha, `Update webhook: ${data.webhooks[webhookIndex].url}`);
    if (!success) {
      throw new Error("Failed to update webhook in GitHub");
    }

    return data.webhooks[webhookIndex];
  }

  async deleteWebhook(webhookId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const webhookIndex = data.webhooks.findIndex(webhook => webhook.id === webhookId);
    if (webhookIndex === -1) {
      return false;
    }

    data.webhooks.splice(webhookIndex, 1);

    const success = await this.updateGitHubFile(data, sha, `Delete webhook: ${webhookId}`);
    return success;
  }

  // Blacklist Management
  async getBlacklistEntries(): Promise<BlacklistEntry[]> {
    const { data } = await this.getGitHubFile();
    return data.blacklistEntries;
  }

  async createBlacklistEntry(entryData: any): Promise<BlacklistEntry> {
    const { data, sha } = await this.getGitHubFile();
    
    const newEntry: BlacklistEntry = {
      id: Date.now(),
      applicationId: entryData.applicationId || null,
      type: entryData.type,
      value: entryData.value,
      reason: entryData.reason || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    data.blacklistEntries.push(newEntry);

    const success = await this.updateGitHubFile(data, sha, `Create blacklist entry: ${entryData.type}:${entryData.value}`);
    if (!success) {
      throw new Error("Failed to create blacklist entry in GitHub");
    }

    return newEntry;
  }

  async deleteBlacklistEntry(entryId: number): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const entryIndex = data.blacklistEntries.findIndex(entry => entry.id === entryId);
    if (entryIndex === -1) {
      return false;
    }

    data.blacklistEntries.splice(entryIndex, 1);

    const success = await this.updateGitHubFile(data, sha, `Delete blacklist entry: ${entryId}`);
    return success;
  }

  async checkBlacklist(applicationId: number, type: 'ip' | 'username' | 'hwid', value: string): Promise<BlacklistEntry | null> {
    const { data } = await this.getGitHubFile();
    
    return data.blacklistEntries.find(entry => 
      (entry.applicationId === applicationId || entry.applicationId === null) &&
      entry.type === type &&
      entry.value === value
    ) || null;
  }

  // Activity Logs
  async getActivityLogs(applicationId: number, limit?: number): Promise<ActivityLog[]> {
    const { data } = await this.getGitHubFile();
    
    let logs = (data.activityLogs || []).filter(log => log.applicationId === applicationId);
    
    // Sort by creation date (newest first)
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (limit) {
      logs = logs.slice(0, limit);
    }
    
    return logs;
  }

  async getUserActivityLogs(userId: number): Promise<ActivityLog[]> {
    const { data } = await this.getGitHubFile();
    
    let logs = (data.activityLogs || []).filter(log => log.appUserId === userId);
    
    // Sort by creation date (newest first)
    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return logs;
  }

  async createActivityLog(logData: any): Promise<ActivityLog> {
    const { data, sha } = await this.getGitHubFile();
    
    const newLog: ActivityLog = {
      id: Date.now(),
      applicationId: logData.applicationId,
      appUserId: logData.appUserId || null,
      event: logData.event,
      success: logData.success,
      errorMessage: logData.errorMessage || null,
      ipAddress: logData.ipAddress || null,
      userAgent: logData.userAgent || null,
      metadata: logData.metadata || {},
      createdAt: new Date()
    };

    // Ensure activityLogs array exists
    if (!data.activityLogs) {
      data.activityLogs = [];
    }
    data.activityLogs.push(newLog);

    // Keep only last 1000 logs per application to prevent file from getting too large
    const appLogs = (data.activityLogs || []).filter(log => log.applicationId === logData.applicationId);
    if (appLogs.length > 1000) {
      appLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const toKeep = appLogs.slice(0, 1000);
      data.activityLogs = (data.activityLogs || []).filter(log => 
        log.applicationId !== logData.applicationId
      ).concat(toKeep);
    }

    const success = await this.updateGitHubFile(data, sha, `Add activity log: ${logData.event}`);
    if (!success) {
      throw new Error("Failed to create activity log in GitHub");
    }

    return newLog;
  }

  // Active Sessions
  async getActiveSessions(applicationId: number): Promise<ActiveSession[]> {
    const { data } = await this.getGitHubFile();
    return (data.activeSessions || []).filter(session => 
      session.applicationId === applicationId && session.isActive
    );
  }

  async createActiveSession(sessionData: any): Promise<ActiveSession> {
    const { data, sha } = await this.getGitHubFile();
    
    const newSession: ActiveSession = {
      id: Date.now(),
      applicationId: sessionData.applicationId,
      appUserId: sessionData.appUserId,
      sessionToken: sessionData.sessionToken,
      ipAddress: sessionData.ipAddress || null,
      userAgent: sessionData.userAgent || null,
      location: sessionData.location || null,
      hwid: sessionData.hwid || null,
      expiresAt: sessionData.expiresAt ? new Date(sessionData.expiresAt) : null,
      isActive: sessionData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Ensure activeSessions array exists
    if (!data.activeSessions) {
      data.activeSessions = [];
    }
    data.activeSessions.push(newSession);

    const success = await this.updateGitHubFile(data, sha, `Create active session: ${newSession.sessionToken}`);
    if (!success) {
      throw new Error("Failed to create active session in GitHub");
    }

    return newSession;
  }

  async updateSessionActivity(sessionToken: string): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const sessionIndex = (data.activeSessions || []).findIndex(session => session.sessionToken === sessionToken);
    if (sessionIndex === -1) {
      return false;
    }

    (data.activeSessions || [])[sessionIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `Update session activity: ${sessionToken}`);
    return success;
  }

  async endSession(sessionToken: string): Promise<boolean> {
    const { data, sha } = await this.getGitHubFile();
    
    const sessionIndex = (data.activeSessions || []).findIndex(session => session.sessionToken === sessionToken);
    if (sessionIndex === -1) {
      return false;
    }

    (data.activeSessions || [])[sessionIndex].isActive = false;
    (data.activeSessions || [])[sessionIndex].updatedAt = new Date();

    const success = await this.updateGitHubFile(data, sha, `End session: ${sessionToken}`);
    return success;
  }

  // Custom Messages Management
  async getCustomMessages(): Promise<CustomMessages> {
    const { data } = await this.getGitHubFile();
    // Return custom messages if they exist, otherwise return default messages
    return data.customMessages || DEFAULT_MESSAGES;
  }

  async updateCustomMessages(messages: Partial<CustomMessages>): Promise<CustomMessages> {
    const { data, sha } = await this.getGitHubFile();
    
    // Merge with existing messages and defaults
    const updatedMessages: CustomMessages = {
      ...DEFAULT_MESSAGES,
      ...data.customMessages,
      ...messages
    };
    
    data.customMessages = updatedMessages;
    data.metadata.lastUpdated = new Date().toISOString();
    
    const success = await this.updateGitHubFile(data, sha, "Update custom messages");
    if (!success) {
      throw new Error("Failed to update custom messages in GitHub");
    }
    
    return updatedMessages;
  }

  async resetCustomMessages(): Promise<CustomMessages> {
    const { data, sha } = await this.getGitHubFile();
    
    data.customMessages = DEFAULT_MESSAGES;
    data.metadata.lastUpdated = new Date().toISOString();
    
    const success = await this.updateGitHubFile(data, sha, "Reset custom messages to defaults");
    if (!success) {
      throw new Error("Failed to reset custom messages in GitHub");
    }
    
    return DEFAULT_MESSAGES;
  }
}

// Export singleton instance
export const githubService = new GitHubService();
