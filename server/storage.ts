import { githubService } from "./githubService";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

// Import types from githubService
import type {
  User,
  Application,
  AppUser,
  LicenseKey,
  Webhook,
  BlacklistEntry,
  ActivityLog,
  ActiveSession,
  CustomMessages
} from "./githubService";

// Interface for storage operations (maintaining compatibility)
export interface IStorage {
  // User operations for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  upsertUser(user: Partial<User>): Promise<User>;
  
  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationByApiKey(apiKey: string): Promise<Application | undefined>;
  createApplication(userId: string, app: any): Promise<Application>;
  updateApplication(id: number, updates: any): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  getAllApplications(userId?: string): Promise<Application[]>;
  
  // License Key methods
  getLicenseKey(id: number): Promise<LicenseKey | undefined>;
  getLicenseKeyByKey(licenseKey: string): Promise<LicenseKey | undefined>;
  createLicenseKey(applicationId: number, license: any): Promise<LicenseKey>;
  updateLicenseKey(id: number, updates: any): Promise<LicenseKey | undefined>;
  deleteLicenseKey(id: number): Promise<boolean>;
  getAllLicenseKeys(applicationId: number): Promise<LicenseKey[]>;
  validateLicenseKey(licenseKey: string, applicationId: number): Promise<LicenseKey | null>;
  
  // App User methods
  getAppUser(id: number): Promise<AppUser | undefined>;
  getAppUserByUsername(applicationId: number, username: string): Promise<AppUser | undefined>;
  getAppUserByEmail(applicationId: number, email: string): Promise<AppUser | undefined>;
  createAppUser(applicationId: number, user: any): Promise<AppUser>;
  createAppUserWithLicense(applicationId: number, user: any): Promise<AppUser>;
  updateAppUser(id: number, updates: any): Promise<AppUser | undefined>;
  deleteAppUser(id: number): Promise<boolean>;
  getAllAppUsers(applicationId: number): Promise<AppUser[]>;
  pauseAppUser(id: number): Promise<boolean>;
  unpauseAppUser(id: number): Promise<boolean>;
  resetAppUserHwid(id: number): Promise<boolean>;
  banAppUser(id: number): Promise<boolean>;
  unbanAppUser(id: number): Promise<boolean>;
  updateAppUser(id: number, userData: any): Promise<boolean>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Webhook methods
  getWebhook(id: number): Promise<Webhook | undefined>;
  createWebhook(userId: string, webhook: any): Promise<Webhook>;
  updateWebhook(id: number, updates: any): Promise<Webhook | undefined>;
  deleteWebhook(id: number): Promise<boolean>;
  getUserWebhooks(userId: string): Promise<Webhook[]>;
  
  // Blacklist methods
  getBlacklistEntry(id: number): Promise<BlacklistEntry | undefined>;
  createBlacklistEntry(entry: any): Promise<BlacklistEntry>;
  updateBlacklistEntry(id: number, updates: any): Promise<BlacklistEntry | undefined>;
  deleteBlacklistEntry(id: number): Promise<boolean>;
  getBlacklistEntries(): Promise<BlacklistEntry[]>;
  checkBlacklist(applicationId: number, type: 'ip' | 'username' | 'hwid', value: string): Promise<BlacklistEntry | null>;
  
  // Activity Log methods
  getActivityLog(id: number): Promise<ActivityLog | undefined>;
  createActivityLog(log: any): Promise<ActivityLog>;
  getActivityLogs(applicationId: number, limit?: number): Promise<ActivityLog[]>;
  getUserActivityLogs(userId: number): Promise<ActivityLog[]>;
  
  // Active Session methods
  getActiveSession(id: number): Promise<ActiveSession | undefined>;
  createActiveSession(session: any): Promise<ActiveSession>;
  updateSessionActivity(sessionToken: string): Promise<boolean>;
  endSession(sessionToken: string): Promise<boolean>;
  getActiveSessions(applicationId: number): Promise<ActiveSession[]>;
}

// GitHub-based storage implementation
class GitHubStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return await githubService.getUser(id) || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await githubService.getAllUsers();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    return await githubService.updateUser(id, updates) || undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    return await githubService.deleteUser(id);
  }

  async upsertUser(user: Partial<User>): Promise<User> {
    return await githubService.upsertUser(user);
  }

  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    return await githubService.getApplication(id) || undefined;
  }

  async getApplicationByApiKey(apiKey: string): Promise<Application | undefined> {
    return await githubService.getApplicationByApiKey(apiKey) || undefined;
  }

  async createApplication(userId: string, app: any): Promise<Application> {
    return await githubService.createApplication(userId, app);
  }

  async updateApplication(id: number, updates: any): Promise<Application | undefined> {
    return await githubService.updateApplication(id, updates) || undefined;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return await githubService.deleteApplication(id);
  }

  async getAllApplications(userId?: string): Promise<Application[]> {
    return await githubService.getAllApplications(userId);
  }

  // License Key methods
  async getLicenseKey(id: number): Promise<LicenseKey | undefined> {
    return await githubService.getLicenseKey(id) || undefined;
  }

  async getLicenseKeyByKey(licenseKey: string): Promise<LicenseKey | undefined> {
    return await githubService.getLicenseKeyByKey(licenseKey) || undefined;
  }

  async createLicenseKey(applicationId: number, license: any): Promise<LicenseKey> {
    return await githubService.createLicenseKey(applicationId, license);
  }

  async updateLicenseKey(id: number, updates: any): Promise<LicenseKey | undefined> {
    // Note: GitHub service doesn't have updateLicenseKey, but we can implement it if needed
    throw new Error("updateLicenseKey not implemented in GitHub service");
  }

  async deleteLicenseKey(id: number): Promise<boolean> {
    return await githubService.deleteLicenseKey(id);
  }

  async getAllLicenseKeys(applicationId: number): Promise<LicenseKey[]> {
    return await githubService.getAllLicenseKeys(applicationId);
  }

  async validateLicenseKey(licenseKey: string, applicationId: number): Promise<LicenseKey | null> {
    return await githubService.validateLicenseKey(licenseKey, applicationId);
  }

  // App User methods
  async getAppUser(id: number): Promise<AppUser | undefined> {
    return await githubService.getAppUser(id) || undefined;
  }

  async getAppUserByUsername(applicationId: number, username: string): Promise<AppUser | undefined> {
    return await githubService.getAppUserByUsername(applicationId, username) || undefined;
  }

  async getAppUserByEmail(applicationId: number, email: string): Promise<AppUser | undefined> {
    return await githubService.getAppUserByEmail(applicationId, email) || undefined;
  }

  async createAppUser(applicationId: number, user: any): Promise<AppUser> {
    return await githubService.createAppUser(applicationId, user);
  }

  async createAppUserWithLicense(applicationId: number, user: any): Promise<AppUser> {
    return await githubService.createAppUserWithLicense(applicationId, user);
  }

  async updateAppUser(id: number, updates: any): Promise<AppUser | undefined> {
    return await githubService.updateAppUser(id, updates) || undefined;
  }

  async deleteAppUser(id: number): Promise<boolean> {
    return await githubService.deleteAppUser(id);
  }

  async getAllAppUsers(applicationId: number): Promise<AppUser[]> {
    return await githubService.getAllAppUsers(applicationId);
  }

  async pauseAppUser(id: number): Promise<boolean> {
    return await githubService.pauseAppUser(id);
  }

  async unpauseAppUser(id: number): Promise<boolean> {
    return await githubService.unpauseAppUser(id);
  }

  async resetAppUserHwid(id: number): Promise<boolean> {
    return await githubService.resetAppUserHwid(id);
  }

  async banAppUser(id: number): Promise<boolean> {
    return await githubService.banAppUser(id);
  }

  async unbanAppUser(id: number): Promise<boolean> {
    return await githubService.unbanAppUser(id);
  }


  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await githubService.validatePassword(password, hashedPassword);
  }

  // Webhook methods
  async getWebhook(id: number): Promise<Webhook | undefined> {
    // Note: GitHub service doesn't have getWebhook, but we can implement it if needed
    throw new Error("getWebhook not implemented in GitHub service");
  }

  async createWebhook(userId: string, webhook: any): Promise<Webhook> {
    return await githubService.createWebhook(userId, webhook);
  }

  async updateWebhook(id: number, updates: any): Promise<Webhook | undefined> {
    return await githubService.updateWebhook(id, updates) || undefined;
  }

  async deleteWebhook(id: number): Promise<boolean> {
    return await githubService.deleteWebhook(id);
  }

  async getUserWebhooks(userId: string): Promise<Webhook[]> {
    return await githubService.getUserWebhooks(userId);
  }

  // Blacklist methods
  async getBlacklistEntry(id: number): Promise<BlacklistEntry | undefined> {
    // Note: GitHub service doesn't have getBlacklistEntry, but we can implement it if needed
    throw new Error("getBlacklistEntry not implemented in GitHub service");
  }

  async createBlacklistEntry(entry: any): Promise<BlacklistEntry> {
    return await githubService.createBlacklistEntry(entry);
  }

  async updateBlacklistEntry(id: number, updates: any): Promise<BlacklistEntry | undefined> {
    // Note: GitHub service doesn't have updateBlacklistEntry, but we can implement it if needed
    throw new Error("updateBlacklistEntry not implemented in GitHub service");
  }

  async deleteBlacklistEntry(id: number): Promise<boolean> {
    return await githubService.deleteBlacklistEntry(id);
  }

  async getBlacklistEntries(): Promise<BlacklistEntry[]> {
    return await githubService.getBlacklistEntries();
  }

  async checkBlacklist(applicationId: number, type: 'ip' | 'username' | 'hwid', value: string): Promise<BlacklistEntry | null> {
    return await githubService.checkBlacklist(applicationId, type, value);
  }

  // Activity Log methods
  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    // Note: GitHub service doesn't have getActivityLog, but we can implement it if needed
    throw new Error("getActivityLog not implemented in GitHub service");
  }

  async createActivityLog(log: any): Promise<ActivityLog> {
    return await githubService.createActivityLog(log);
  }

  async getActivityLogs(applicationId: number, limit?: number): Promise<ActivityLog[]> {
    return await githubService.getActivityLogs(applicationId, limit);
  }

  async getUserActivityLogs(userId: number): Promise<ActivityLog[]> {
    return await githubService.getUserActivityLogs(userId);
  }

  // Active Session methods
  async getActiveSession(id: number): Promise<ActiveSession | undefined> {
    // Note: GitHub service doesn't have getActiveSession, but we can implement it if needed
    throw new Error("getActiveSession not implemented in GitHub service");
  }

  async createActiveSession(session: any): Promise<ActiveSession> {
    return await githubService.createActiveSession(session);
  }

  async updateSessionActivity(sessionToken: string): Promise<boolean> {
    return await githubService.updateSessionActivity(sessionToken);
  }

  async endSession(sessionToken: string): Promise<boolean> {
    return await githubService.endSession(sessionToken);
  }

  async getActiveSessions(applicationId: number): Promise<ActiveSession[]> {
    return await githubService.getActiveSessions(applicationId);
  }

  // Custom Messages Management
  async getCustomMessages(): Promise<CustomMessages> {
    return await githubService.getCustomMessages();
  }

  async updateCustomMessages(messages: Partial<CustomMessages>): Promise<CustomMessages> {
    return await githubService.updateCustomMessages(messages);
  }

  async resetCustomMessages(): Promise<CustomMessages> {
    return await githubService.resetCustomMessages();
  }
}

// Export singleton instance
export const storage = new GitHubStorage();