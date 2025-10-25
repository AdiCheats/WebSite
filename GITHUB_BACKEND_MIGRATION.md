# GitHub Backend Migration

This project has been successfully migrated from a database/Firebase backend to a GitHub-based backend system, similar to the Discord bot implementation.

## Changes Made

### 1. GitHub Service (`server/githubService.ts`)
- Created a comprehensive GitHub service that uses GitHub as a database
- Implements all CRUD operations for users, applications, app users, license keys, webhooks, blacklist entries, activity logs, and active sessions
- Uses GitHub API to store data in a JSON file in the repository
- Similar structure to the Discord bot's GitHub integration

### 2. Authentication System (`server/auth.ts`)
- Replaced Firebase authentication with simple session-based authentication
- Removed dependency on Firebase services
- Uses GitHub service for user management

### 3. Storage Layer (`server/storage.ts`)
- Replaced database storage with GitHub service
- Maintains the same interface for compatibility with existing routes
- All data operations now go through GitHub API

### 4. Environment Configuration (`server/environment.ts`)
- Updated to use GitHub configuration instead of database
- Added GitHub token, user, repo, and data file configuration

### 5. Client-Side Changes
- Updated authentication hooks to work without Firebase
- Created simple login page (`client/src/pages/simple-login.tsx`)
- Updated auth service to use simple session-based authentication

### 6. Removed Dependencies
- Removed Firebase dependencies
- Removed database dependencies (Neon, Drizzle ORM)
- Removed Passport.js dependencies
- Cleaned up unused files

## Environment Variables Required

Create a `.env` file in the server directory with:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_token_here
GITHUB_USER=your_github_username
GITHUB_REPO=your_repo_name
DATA_FILE=user.json

# Application Configuration
NODE_ENV=development
PORT=3000

# Session Configuration
SESSION_SECRET=your-session-secret-here-change-this-in-production
```

## GitHub Setup

1. Create a GitHub repository (or use existing one)
2. Generate a GitHub personal access token with repo permissions
3. The system will automatically create a `user.json` file in your repository root
4. All data will be stored in this JSON file and managed through GitHub API

## Features Maintained

All original features are maintained:
- User management
- Application management
- License key management
- Webhook system
- Blacklist functionality
- Activity logging
- Session tracking
- API authentication

## Benefits of GitHub Backend

1. **No Database Costs**: No need for external database services
2. **Version Control**: All data changes are tracked in GitHub
3. **Backup**: Automatic backup through GitHub
4. **Collaboration**: Multiple developers can manage the data
5. **Transparency**: All data is visible in the repository
6. **Simplicity**: No complex database setup required

## Usage

1. Set up environment variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Access the application and use the simple login system
5. All data will be stored in your GitHub repository

## API Compatibility

The API endpoints remain the same, ensuring compatibility with existing integrations. The system now uses GitHub as the data storage backend instead of a traditional database.
