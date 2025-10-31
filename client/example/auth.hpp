#pragma once
#define CURL_STATICLIB
#include "Curl/curl.h"
#include <windows.h>
#include <iostream>
#include <string>
#include <atlsecurity.h>
#include "json.hpp"

#pragma comment(lib, "ws2_32.lib")
#pragma comment(lib, "Normaliz.lib")
#pragma comment(lib, "Crypt32.lib")
#pragma comment(lib, "Wldap32.lib")

/**
 * AdiCheats C++ Authentication Library
 * 
 * This library provides a simple interface to authenticate users
 * against the AdiCheats authentication system via REST API.
 * 
 * Features:
 * - Username/Password authentication
 * - Automatic HWID generation and locking
 * - Version checking
 * - Session verification
 * - Comprehensive error handling
 * 
 * Usage Example:
 *   c_auth auth;
 *   auth.setup();  // Initialize connection
 *   auto response = auth.Login("username", "password");
 *   if (response.success) {
 *       // Login successful - access user data
 *       std::cout << "Welcome, " << response.username << std::endl;
 *   } else {
 *       // Handle error
 *       std::cout << "Error: " << response.message << std::endl;
 *   }
 */

class c_auth {
private:
    using json = nlohmann::json;

    // ===== CONFIGURATION =====
    // IMPORTANT: Replace these values with your actual AdiCheats credentials
    // You can find these in your AdiCheats dashboard
    
    const std::string api_url = ("https://your-replit-url.replit.dev/api/v1");  // Your API base URL
    const std::string api_key = ("your-api-key-here");                           // Your application API key
    const std::string app_version = ("1.0.0");                                   // Your application version
    
    // ===== INTERNAL STATE =====
    std::string hwid;  // Automatically generated hardware ID
    bool initialized = false;

    /**
     * Callback function for CURL to write received data
     */
    static inline auto write_callback(void* contents, size_t size, size_t nmemb, void* userp) -> size_t {
        ((std::string*)userp)->append((char*)contents, size * nmemb);
        return size * nmemb;
    }

    /**
     * Generates a unique hardware ID based on Windows SID
     * This ensures each computer has a unique identifier
     */
    static std::string get_hwid() {
        ATL::CAccessToken accessToken;
        ATL::CSid currentUserSid;
        if (accessToken.GetProcessToken(TOKEN_READ | TOKEN_QUERY) &&
            accessToken.GetUser(&currentUserSid))
            return std::string(CT2A(currentUserSid.Sid()));
        return "none";
    }

    /**
     * Performs HTTP POST request to the AdiCheats API
     * 
     * @param endpoint - API endpoint (e.g., "/login")
     * @param payload - JSON payload to send
     * @return Server response as string
     */
    std::string perform_request(const std::string& endpoint, const std::string& payload) {
        std::string response;
        CURL* hnd = curl_easy_init();
        if (!hnd) {
            return R"({"success": false, "message": "Failed to initialize CURL"})";
        }

        std::string full_url = api_url + endpoint;

        curl_easy_setopt(hnd, CURLOPT_CUSTOMREQUEST, ("POST"));
        curl_easy_setopt(hnd, CURLOPT_URL, full_url.c_str());

        // Set headers
        struct curl_slist* headers = NULL;
        headers = curl_slist_append(headers, ("Content-Type: application/json"));
        
        // Add API key header
        std::string api_key_header = "X-API-Key: " + api_key;
        headers = curl_slist_append(headers, api_key_header.c_str());
        
        curl_easy_setopt(hnd, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(hnd, CURLOPT_WRITEFUNCTION, write_callback);
        curl_easy_setopt(hnd, CURLOPT_WRITEDATA, &response);
        curl_easy_setopt(hnd, CURLOPT_POSTFIELDS, payload.c_str());

        // Optional: Disable SSL verification for testing (enable in production)
        // curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYPEER, 0L);
        // curl_easy_setopt(hnd, CURLOPT_SSL_VERIFYHOST, 0L);

        CURLcode ret = curl_easy_perform(hnd);
        curl_slist_free_all(headers);
        curl_easy_cleanup(hnd);

        if (ret != CURLE_OK) {
            return R"({"success": false, "message": "Network error: )" + std::string(curl_easy_strerror(ret)) + "\"}";
        }

        return response;
    }

public:
    /**
     * Response structure for authentication operations
     */
    struct Response {
        bool success = false;           // Whether the operation succeeded
        std::string message;            // Status message or error description
        int user_id = 0;               // User ID (if login successful)
        std::string username;           // Username (if login successful)
        std::string email;              // User email (if available)
        std::string expires_at;         // Account expiration date
        bool hwid_locked = false;       // Whether HWID locking is enabled
        std::string required_version;   // Required app version (if version mismatch)
        std::string current_version;    // Current app version
    };

    /**
     * Constructor - Initializes CURL globally
     */
    c_auth() {
        curl_global_init(CURL_GLOBAL_DEFAULT);
        hwid = get_hwid();
    }

    /**
     * Destructor - Cleans up CURL resources
     */
    ~c_auth() {
        curl_global_cleanup();
    }

    /**
     * Initialize connection to AdiCheats API
     * This is optional - the library will work without calling setup()
     * 
     * @return Response structure with success/failure status
     */
    inline auto setup() -> Response {
        Response resp;
        
        if (api_key.empty() || api_key == "your-api-key-here") {
            resp.success = false;
            resp.message = "API key not configured. Please set your API key in auth.hpp";
            return resp;
        }

        if (api_url.empty() || api_url.find("your-replit-url") != std::string::npos) {
            resp.success = false;
            resp.message = "API URL not configured. Please set your API URL in auth.hpp";
            return resp;
        }

        initialized = true;
        resp.success = true;
        resp.message = "AdiCheats authentication library initialized successfully";
        return resp;
    }

    /**
     * Login with username and password
     * 
     * @param username - User's username
     * @param password - User's password
     * @return Response structure with login result
     */
    inline auto Login(const std::string& username, const std::string& password) -> Response {
        Response resp;

        if (api_key.empty() || api_key == "your-api-key-here") {
            resp.success = false;
            resp.message = "API key not configured. Please set your API key in auth.hpp";
            return resp;
        }

        try {
            // Build request payload
            json payload = {
                {"username", username},
                {"password", password},
                {"api_key", api_key},
                {"version", app_version},
                {"hwid", hwid}
            };

            std::string response = perform_request("/login", payload.dump());

            // Parse response
            json response_json = json::parse(response);

            resp.success = response_json.value("success", false);
            resp.message = response_json.value("message", "Unknown error");

            if (resp.success) {
                // Extract user data on successful login
                if (response_json.contains("user_id")) {
                    resp.user_id = response_json["user_id"].get<int>();
                }
                if (response_json.contains("username")) {
                    resp.username = response_json["username"].get<std::string>();
                }
                if (response_json.contains("email") && !response_json["email"].is_null()) {
                    resp.email = response_json["email"].get<std::string>();
                }
                if (response_json.contains("expires_at") && !response_json["expires_at"].is_null()) {
                    resp.expires_at = response_json["expires_at"].get<std::string>();
                }
                if (response_json.contains("hwid_locked")) {
                    resp.hwid_locked = response_json["hwid_locked"].get<bool>();
                }
            } else {
                // Extract version mismatch info if available
                if (response_json.contains("required_version")) {
                    resp.required_version = response_json["required_version"].get<std::string>();
                }
                if (response_json.contains("current_version")) {
                    resp.current_version = response_json["current_version"].get<std::string>();
                }
            }

            return resp;
        }
        catch (json::parse_error& e) {
            resp.success = false;
            resp.message = "Failed to parse server response: " + std::string(e.what());
            return resp;
        }
        catch (std::exception& e) {
            resp.success = false;
            resp.message = "Error: " + std::string(e.what());
            return resp;
        }
    }

    /**
     * Verify a user session (check if user is still valid)
     * 
     * @param user_id - ID of the user to verify
     * @return Response structure with verification result
     */
    inline auto VerifySession(int user_id) -> Response {
        Response resp;

        try {
            json payload = {
                {"user_id", user_id}
            };

            std::string response = perform_request("/verify", payload.dump());
            json response_json = json::parse(response);

            resp.success = response_json.value("success", false);
            resp.message = response_json.value("message", "Unknown error");

            if (resp.success) {
                if (response_json.contains("user_id")) {
                    resp.user_id = response_json["user_id"].get<int>();
                }
                if (response_json.contains("username")) {
                    resp.username = response_json["username"].get<std::string>();
                }
                if (response_json.contains("expires_at") && !response_json["expires_at"].is_null()) {
                    resp.expires_at = response_json["expires_at"].get<std::string>();
                }
            }

            return resp;
        }
        catch (json::parse_error& e) {
            resp.success = false;
            resp.message = "Failed to parse server response";
            return resp;
        }
        catch (std::exception& e) {
            resp.success = false;
            resp.message = "Error: " + std::string(e.what());
            return resp;
        }
    }

    /**
     * Get the current hardware ID
     * 
     * @return Hardware ID string
     */
    std::string GetHWID() const {
        return hwid;
    }

    /**
     * Get the configured API URL
     * 
     * @return API URL string
     */
    std::string GetAPIUrl() const {
        return api_url;
    }

    /**
     * Get the configured application version
     * 
     * @return Version string
     */
    std::string GetVersion() const {
        return app_version;
    }
};

// Global instance for easy access
// You can use this directly in your application
inline c_auth g_Auth;

