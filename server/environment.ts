// Environment configuration for cross-platform deployment
export const config = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
  GITHUB_USER: process.env.GITHUB_USER || '',
  GITHUB_REPO: process.env.GITHUB_REPO || '',
  DATA_FILE: process.env.DATA_FILE || '',
  
  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-secret-change-in-production',
  
  // Legacy Database (no longer used)
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Replit-specific (optional)
  REPLIT_DOMAINS: process.env.REPLIT_DOMAINS || '',
  REPL_ID: process.env.REPL_ID || '',
  ISSUER_URL: process.env.ISSUER_URL || 'https://replit.com/oidc',
  
  // Firebase (optional - no longer used)
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000'),
  
  // Feature flags
  isReplitEnvironment: !!process.env.REPLIT_DOMAINS,
  isProduction: process.env.NODE_ENV === 'production',
};

export function validateRequiredEnvVars() {
  const required = ['GITHUB_TOKEN', 'GITHUB_USER', 'GITHUB_REPO'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`Warning: Missing GitHub environment variables: ${missing.join(', ')}`);
    if (config.isProduction) {
      throw new Error(`Required GitHub environment variables missing: ${missing.join(', ')}`);
    }
  }
  
  return true;
}