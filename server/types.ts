// Type definitions for Express request extensions
declare global {
  namespace Express {
    interface Request {
      user?: {
        claims: {
          sub: string;
          email: string;
        };
      };
      application?: any;
    }
  }
}

// Re-export types from githubService
export type { 
  User, 
  Application, 
  AppUser, 
  LicenseKey, 
  Subscription,
  Webhook, 
  BlacklistEntry, 
  ActivityLog, 
  ActiveSession 
} from './githubService';

export {};
