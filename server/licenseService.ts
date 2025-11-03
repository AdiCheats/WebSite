import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

// GitHub Configuration for License Storage
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const LICENSE_FILE = "License.json"; // Separate file for licenses
const LICENSE_BASE_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${LICENSE_FILE}`;

// Validate configuration
if (!GITHUB_TOKEN || !GITHUB_USER || !GITHUB_REPO) {
  console.error("\n" + "=".repeat(70));
  console.error("❌ CRITICAL: Missing GitHub configuration for License Service!");
  console.error("=".repeat(70));
} else {
  console.log("\n✓ License Service GitHub configuration loaded");
  console.log(`  Repository: ${GITHUB_USER}/${GITHUB_REPO}`);
  console.log(`  License File: ${LICENSE_FILE}\n`);
}

// Enhanced License Key Interface with HWID Management
export interface License {
  id: string;
  licenseKey: string;
  applicationId: number;
  maxUsers: number;
  currentUsers: number;
  validityDays: number;
  expiresAt: Date;
  description: string | null;
  isActive: boolean;
  isBanned: boolean;
  hwid: string | null;
  hwidLockEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Application data embedded in license for self-contained validation
  applicationData?: {
    name: string;
    apiKey: string;
    version: string;
    isActive: boolean;
  };
}

// GitHub Data Structure for Licenses
interface LicenseData {
  licenses: License[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}

class LicenseService {
  private cache: { data: LicenseData; sha: string | null; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5000; // 5 seconds cache
  private writeQueue: Promise<boolean> = Promise.resolve(true);
  private pendingWrites = 0;

  // Retry logic for GitHub API calls
  private async fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 200 || response.status === 404 || 
            response.status === 401 || response.status === 403 || 
            response.status === 422) {
          return response;
        }
        
        if (response.status === 429 || response.status >= 500) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, i) * 1000;
          
          console.log(`GitHub API rate limited or server error (${response.status}). Retrying in ${waitTime}ms... (${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        return response;
      } catch (error) {
        if (i === retries - 1) throw error;
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`GitHub API request failed. Retrying in ${waitTime}ms... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw new Error('Failed to fetch from GitHub after retries');
  }

  private async getLicenseFile(forceRefresh = false): Promise<{ data: LicenseData; sha: string | null }> {
    // Return cached data if available and not expired
    if (!forceRefresh && this.cache) {
      const age = Date.now() - this.cache.timestamp;
      if (age < this.CACHE_TTL) {
        return { data: this.cache.data, sha: this.cache.sha };
      }
    }

    const headers = {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "adi-cheats-license-service"
    };

    try {
      const response = await this.fetchWithRetry(LICENSE_BASE_URL, { headers });
      
      if (response.status === 404) {
        // Initialize fresh License.json structure
        const initialData: LicenseData = {
          licenses: [],
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0"
          }
        };
        return { data: initialData, sha: null };
      }

      if (response.status !== 200) {
        const errorText = await response.text();
        console.error(`❌ GitHub API Error: ${response.status}`);
        console.error(`Response: ${errorText}`);
        throw new Error(`GitHub API error: ${response.status} - ${errorText}`);
      }

      const githubData = await response.json();
      
      let contentText: string;
      if (githubData.encoding === "base64") {
        const decoded = Buffer.from(githubData.content, 'base64').toString('utf-8');
        contentText = decoded;
      } else if (githubData.download_url) {
        const rawResponse = await fetch(githubData.download_url, {
          headers: { "User-Agent": "adi-cheats-license-service" }
        });
        if (rawResponse.status !== 200) {
          throw new Error(`Failed to fetch raw content: ${rawResponse.status}`);
        }
        contentText = await rawResponse.text();
      } else {
        throw new Error("No content available");
      }

      // Handle empty file or parse JSON
      let parsedData;
      try {
        parsedData = contentText && contentText.trim() 
          ? JSON.parse(contentText)
          : {
              licenses: [],
              metadata: {
                lastUpdated: new Date().toISOString(),
                version: "1.0.0"
              }
            };
      } catch (parseError) {
        console.error("Error parsing License.json, using default structure:", parseError);
        parsedData = {
          licenses: [],
          metadata: {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0"
          }
        };
      }
      
      // Ensure licenses array is properly initialized
      const data: LicenseData = {
        licenses: Array.isArray(parsedData.licenses) ? parsedData.licenses : [],
        metadata: parsedData.metadata || {
          lastUpdated: new Date().toISOString(),
          version: "1.0.0"
        }
      };
      
      // Update cache
      this.cache = {
        data,
        sha: githubData.sha,
        timestamp: Date.now()
      };
      
      return { data, sha: githubData.sha };
    } catch (error) {
      console.error("Error fetching License file:", error);
      throw error;
    }
  }

  private async updateLicenseFile(data: LicenseData, sha: string | null, message: string, skipQueue = false): Promise<boolean> {
    // Queue writes to avoid conflicts
    if (!skipQueue) {
      this.pendingWrites++;
      const currentWrite = this.writeQueue.then(() => 
        this.updateLicenseFile(data, sha, message, true)
      );
      this.writeQueue = currentWrite.then(() => {
        this.pendingWrites--;
        return true;
      }).catch(() => {
        this.pendingWrites--;
        return false;
      });
      return currentWrite;
    }

    const headers = {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "adi-cheats-license-service"
    };

    try {
      // Update metadata
      data.metadata.lastUpdated = new Date().toISOString();
      
      const content = JSON.stringify(data, null, 2);
      const encodedContent = Buffer.from(content, 'utf-8').toString('base64');

      const payload: any = {
        message,
        content: encodedContent
      };

      if (sha) {
        payload.sha = sha;
      }

      const response = await this.fetchWithRetry(LICENSE_BASE_URL, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.status !== 200 && response.status !== 201) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        this.cache = null;
        console.error("GitHub API Error:", response.status, errorMessage);
        return false;
      }

      // Update cache with new data and SHA
      const responseData = await response.json();
      this.cache = {
        data,
        sha: responseData.content?.sha || sha,
        timestamp: Date.now()
      };

      return true;
    } catch (error) {
      this.cache = null;
      console.error("Error updating License file:", error);
      return false;
    }
  }

  // Force cache refresh
  invalidateCache(): void {
    console.log('[LicenseService] Cache invalidated');
    this.cache = null;
  }
  
  // Get cache status
  getCacheStatus() {
    if (!this.cache) {
      return { cached: false, age: 0 };
    }
    const age = Date.now() - this.cache.timestamp;
    return {
      cached: true,
      age,
      licensesCount: this.cache.data.licenses?.length || 0,
      stale: age > this.CACHE_TTL
    };
  }

  // Get all licenses
  async getAllLicenses(): Promise<License[]> {
    const { data } = await this.getLicenseFile();
    return data.licenses || [];
  }

  // Get licenses by application ID
  async getLicensesByApplication(applicationId: number): Promise<License[]> {
    const { data } = await this.getLicenseFile();
    return (data.licenses || []).filter(license => license.applicationId === applicationId);
  }

  // Get license by ID
  async getLicenseById(licenseId: string): Promise<License | null> {
    const { data } = await this.getLicenseFile();
    return (data.licenses || []).find(license => license.id === licenseId) || null;
  }

  // Get license by key
  async getLicenseByKey(licenseKey: string): Promise<License | null> {
    const { data } = await this.getLicenseFile();
    return (data.licenses || []).find(license => license.licenseKey === licenseKey) || null;
  }

  // Create new license
  async createLicense(licenseData: {
    licenseKey?: string;
    applicationId: number;
    maxUsers: number;
    validityDays: number;
    description?: string;
    hwidLockEnabled?: boolean;
    hwid?: string;
    applicationData?: {
      name: string;
      apiKey: string;
      version: string;
      isActive: boolean;
    };
  }): Promise<License> {
    const { data, sha } = await this.getLicenseFile();
    
    const newLicense: License = {
      id: nanoid(16),
      licenseKey: licenseData.licenseKey || nanoid(32),
      applicationId: licenseData.applicationId,
      maxUsers: licenseData.maxUsers || 1,
      currentUsers: 0,
      validityDays: licenseData.validityDays || 30,
      expiresAt: new Date(Date.now() + (licenseData.validityDays || 30) * 24 * 60 * 60 * 1000),
      description: licenseData.description || null,
      isActive: true,
      isBanned: false,
      hwid: licenseData.hwid || null,
      hwidLockEnabled: licenseData.hwidLockEnabled ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Embed application data in license for self-contained validation
      applicationData: licenseData.applicationData
    };

    if (!data.licenses) {
      data.licenses = [];
    }
    data.licenses.push(newLicense);

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Create license: ${newLicense.licenseKey}`);
    if (!success) {
      this.invalidateCache();
      throw new Error("Failed to create license in GitHub");
    }

    return newLicense;
  }

  // Update license
  async updateLicense(licenseId: string, updates: Partial<License>): Promise<License | null> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return null;
    }

    // If hwidLockEnabled is being disabled, clear the HWID
    if (updates.hwidLockEnabled === false) {
      updates.hwid = null;
    }

    data.licenses[licenseIndex] = {
      ...data.licenses[licenseIndex],
      ...updates,
      updatedAt: new Date()
    };

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Update license: ${data.licenses[licenseIndex].licenseKey}`);
    if (!success) {
      this.invalidateCache();
      throw new Error("Failed to update license in GitHub");
    }

    return data.licenses[licenseIndex];
  }

  // Delete license
  async deleteLicense(licenseId: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    const licenseKey = data.licenses[licenseIndex].licenseKey;
    data.licenses.splice(licenseIndex, 1);

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Delete license: ${licenseKey}`);
    if (!success) {
      this.invalidateCache();
    }
    return success;
  }

  // Validate license key (can work with or without applicationId)
  async validateLicense(licenseKey: string, applicationId?: number, hwid?: string): Promise<{ valid: boolean; message?: string; license?: License }> {
    const { data } = await this.getLicenseFile();
    
    // Find license by key (and optionally by applicationId)
    const license = (data.licenses || []).find(l => {
      if (applicationId) {
        return l.licenseKey === licenseKey && l.applicationId === applicationId;
      }
      return l.licenseKey === licenseKey;
    });

    if (!license) {
      return { valid: false, message: "Invalid license key" };
    }

    if (!license.isActive) {
      return { valid: false, message: "License key is inactive" };
    }

    if (license.isBanned) {
      return { valid: false, message: "License key is banned" };
    }

    if (new Date() > new Date(license.expiresAt)) {
      return { valid: false, message: "License key has expired" };
    }

    if (license.currentUsers >= license.maxUsers) {
      return { valid: false, message: "License key has reached maximum user limit" };
    }

    // Check HWID lock if enabled
    if (license.hwidLockEnabled && license.hwid && hwid) {
      if (license.hwid !== hwid) {
        return { valid: false, message: "Hardware ID mismatch", license };
      }
    }

    return { valid: true, license };
  }
  
  // Validate license using embedded application data
  async validateLicenseWithApiKey(apiKey: string, licenseKey: string, hwid?: string): Promise<{ valid: boolean; message?: string; license?: License }> {
    const { data } = await this.getLicenseFile();
    
    console.log(`[validateLicenseWithApiKey] Looking for license: ${licenseKey}`);
    console.log(`[validateLicenseWithApiKey] With API key: ${apiKey}`);
    console.log(`[validateLicenseWithApiKey] Total licenses: ${data.licenses?.length || 0}`);
    
    // Debug: log all licenses
    (data.licenses || []).forEach((l, i) => {
      console.log(`  License ${i}: ${l.licenseKey}`);
      console.log(`    Has applicationData: ${!!l.applicationData}`);
      console.log(`    API Key: ${l.applicationData?.apiKey || 'N/A'}`);
    });
    
    // Find license that matches both the license key and has matching API key in embedded data
    const license = (data.licenses || []).find(l => 
      l.licenseKey === licenseKey && 
      l.applicationData?.apiKey === apiKey
    );

    if (!license) {
      console.log(`[validateLicenseWithApiKey] ❌ No matching license found`);
      return { valid: false, message: "Invalid API key or license key" };
    }
    
    console.log(`[validateLicenseWithApiKey] ✓ Found matching license`);

    // Check if application is active (from embedded data)
    if (license.applicationData && !license.applicationData.isActive) {
      return { valid: false, message: "Application is inactive" };
    }

    if (!license.isActive) {
      return { valid: false, message: "License key is inactive" };
    }

    if (license.isBanned) {
      return { valid: false, message: "License key is banned" };
    }

    if (new Date() > new Date(license.expiresAt)) {
      return { valid: false, message: "License key has expired" };
    }

    if (license.currentUsers >= license.maxUsers) {
      return { valid: false, message: "License key has reached maximum user limit" };
    }

    // Check HWID lock if enabled
    if (license.hwidLockEnabled && license.hwid && hwid) {
      if (license.hwid !== hwid) {
        return { valid: false, message: "Hardware ID mismatch", license };
      }
    }

    return { valid: true, license };
  }

  // Reset HWID for a license
  async resetLicenseHwid(licenseId: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    data.licenses[licenseIndex].hwid = null;
    data.licenses[licenseIndex].updatedAt = new Date();

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Reset HWID for license: ${data.licenses[licenseIndex].licenseKey}`);
    if (!success) {
      this.invalidateCache();
    }
    return success;
  }

  // Lock HWID for a license
  async lockLicenseHwid(licenseId: string, hwid: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    data.licenses[licenseIndex].hwid = hwid;
    data.licenses[licenseIndex].hwidLockEnabled = true;
    data.licenses[licenseIndex].updatedAt = new Date();

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Lock HWID for license: ${data.licenses[licenseIndex].licenseKey}`);
    if (!success) {
      this.invalidateCache();
    }
    return success;
  }

  // Unlock HWID for a license
  async unlockLicenseHwid(licenseId: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    data.licenses[licenseIndex].hwidLockEnabled = false;
    data.licenses[licenseIndex].hwid = null;
    data.licenses[licenseIndex].updatedAt = new Date();

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Unlock HWID for license: ${data.licenses[licenseIndex].licenseKey}`);
    if (!success) {
      this.invalidateCache();
    }
    return success;
  }

  // Ban license
  async banLicense(licenseId: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    data.licenses[licenseIndex].isBanned = true;
    data.licenses[licenseIndex].isActive = false;
    data.licenses[licenseIndex].updatedAt = new Date();

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Ban license: ${data.licenses[licenseIndex].licenseKey}`);
    if (!success) {
      this.invalidateCache();
    }
    return success;
  }

  // Unban license
  async unbanLicense(licenseId: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.id === licenseId);
    if (licenseIndex === -1) {
      return false;
    }

    data.licenses[licenseIndex].isBanned = false;
    data.licenses[licenseIndex].isActive = true;
    data.licenses[licenseIndex].updatedAt = new Date();

    if (this.cache) {
      this.cache.data = data;
    }

    const success = await this.updateLicenseFile(data, sha, `Unban license: ${data.licenses[licenseIndex].licenseKey}`);
    if (!success) {
      this.invalidateCache();
    }
    return success;
  }

  // Increment license usage
  async incrementLicenseUsage(licenseKey: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.licenseKey === licenseKey);
    if (licenseIndex === -1) {
      return false;
    }

    data.licenses[licenseIndex].currentUsers += 1;
    data.licenses[licenseIndex].updatedAt = new Date();

    const success = await this.updateLicenseFile(data, sha, `Increment usage for license: ${licenseKey}`);
    return success;
  }

  // Decrement license usage
  async decrementLicenseUsage(licenseKey: string): Promise<boolean> {
    const { data, sha } = await this.getLicenseFile();
    
    const licenseIndex = (data.licenses || []).findIndex(license => license.licenseKey === licenseKey);
    if (licenseIndex === -1) {
      return false;
    }

    if (data.licenses[licenseIndex].currentUsers > 0) {
      data.licenses[licenseIndex].currentUsers -= 1;
    }
    data.licenses[licenseIndex].updatedAt = new Date();

    const success = await this.updateLicenseFile(data, sha, `Decrement usage for license: ${licenseKey}`);
    return success;
  }
}

// Export singleton instance
export const licenseService = new LicenseService();

