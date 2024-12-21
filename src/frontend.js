// frontend.js

import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { rateLimit } from 'utils/rate-limit'; // Hypothetical rate limiting utility

// Custom error types
class CrystalBankError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'CrystalBankError';
        this.code = code;
    }
}

class ValidationError extends CrystalBankError {
    constructor(message) {
        super(message, 'VALIDATION_ERROR');
    }
}

class AuthenticationError extends CrystalBankError {
    constructor(message) {
        super(message, 'AUTH_ERROR');
    }
}

// Configuration
const CONFIG = {
    CANISTER_ID: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    HOST: "https://ic0.app",
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms
    RATE_LIMIT: {
        windowMs: 60000, // 1 minute
        maxRequests: 30
    }
};

// Define the canister interface (IDL)
const crystalBankIdl = /* IDL definition */ {};

/**
 * Retry logic for async operations
 * @template T
 * @param {() => Promise<T>} operation - Operation to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise<T>}
 */
async function withRetry(operation, maxRetries = CONFIG.MAX_RETRIES, delay = CONFIG.RETRY_DELAY) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            if (!isRetryableError(error)) {
                throw error;
            }
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
            }
        }
    }
    
    throw lastError;
}

/**
 * Determines if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
function isRetryableError(error) {
    return error.message.includes('network') || 
           error.message.includes('timeout') ||
           error.code === 'IC0503'; // Canister execution trapped
}

class CrystalBankClient {
    constructor() {
        this.agent = null;
        this.actor = null;
        this.authClient = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the client
     * @returns {Promise<void>}
     */
    async initialize() {
        if (this.isInitialized) return;

        // Initialize auth client
        this.authClient = await AuthClient.create();
        
        // Create agent with authentication
        this.agent = new HttpAgent({
            host: CONFIG.HOST,
            identity: this.authClient.getIdentity()
        });

        // Fetch root key in development
        if (process.env.NODE_ENV !== "production") {
            await this.agent.fetchRootKey();
        }

        // Create actor
        this.actor = Actor.createActor(crystalBankIdl, {
            agent: this.agent,
            canisterId: CONFIG.CANISTER_ID
        });

        this.isInitialized = true;
    }

    /**
     * Ensure user is authenticated
     * @throws {AuthenticationError}
     */
    async ensureAuthenticated() {
        if (!this.authClient) {
            throw new AuthenticationError('Client not initialized');
        }

        const isAuthenticated = await this.authClient.isAuthenticated();
        if (!isAuthenticated) {
            throw new AuthenticationError('User not authenticated');
        }
    }

    /**
     * Login user
     * @returns {Promise<void>}
     */
    async login() {
        await this.authClient.login({
            identityProvider: 'https://identity.ic0.app',
            onSuccess: () => {
                // Update agent identity
                this.agent.replaceIdentity(this.authClient.getIdentity());
            }
        });
    }

    /**
     * Logout user
     * @returns {Promise<void>}
     */
    async logout() {
        await this.authClient.logout();
        // Reset agent identity
        this.agent.replaceIdentity(await AuthClient.getAnonymousIdentity());
    }

    /**
     * Register a new player
     * @param {string} playerId - Unique identifier for the player
     * @returns {Promise<any>}
     */
    @rateLimit(CONFIG.RATE_LIMIT.windowMs, CONFIG.RATE_LIMIT.maxRequests)
    async registerPlayer(playerId) {
        await this.ensureAuthenticated();
        
        if (!playerId || typeof playerId !== 'string') {
            throw new ValidationError('Invalid playerId provided');
        }

        return withRetry(async () => {
            try {
                const result = await this.actor.registerPlayer(playerId);
                console.log("Registration successful:", result);
                return result;
            } catch (error) {
                console.error("Error registering player:", error);
                throw new CrystalBankError(
                    `Failed to register player: ${error.message}`,
                    'REGISTRATION_ERROR'
                );
            }
        });
    }

    /**
     * Deposit crystals for a player
     * @param {string} playerId - Unique identifier for the player
     * @param {string} crystalType - Type of crystal to deposit
     * @param {number} amount - Amount of crystals to deposit
     * @returns {Promise<any>}
     */
    @rateLimit(CONFIG.RATE_LIMIT.windowMs, CONFIG.RATE_LIMIT.maxRequests)
    async depositCrystals(playerId, crystalType, amount) {
        await this.ensureAuthenticated();
        
        if (!playerId || !crystalType || typeof amount !== 'number' || amount <= 0) {
            throw new ValidationError('Invalid parameters for crystal deposit');
        }

        return withRetry(async () => {
            try {
                const result = await this.actor.depositCrystals(playerId, crystalType, amount);
                console.log("Deposit successful:", result);
                return result;
            } catch (error) {
                console.error("Error depositing crystals:", error);
                throw new CrystalBankError(
                    `Failed to deposit crystals: ${error.message}`,
                    'DEPOSIT_ERROR'
                );
            }
        });
    }

    /**
     * Convert crystals to FUDDY tokens
     * @param {string} playerId - Unique identifier for the player
     * @returns {Promise<any>}
     */
    @rateLimit(CONFIG.RATE_LIMIT.windowMs, CONFIG.RATE_LIMIT.maxRequests)
    async convertCrystalsToFUDDY(playerId) {
        await this.ensureAuthenticated();
        
        if (!playerId) {
            throw new ValidationError('Invalid playerId provided');
        }

        return withRetry(async () => {
            try {
                const result = await this.actor.convertCrystalsToFUDDY(playerId);
                console.log("Conversion successful:", result);
                return result;
            } catch (error) {
                console.error("Error converting crystals:", error);
                throw new CrystalBankError(
                    `Failed to convert crystals: ${error.message}`,
                    'CONVERSION_ERROR'
                );
            }
        });
    }
}

// Create and export singleton instance
const crystalBankClient = new CrystalBankClient();

export {
    crystalBankClient,
    CrystalBankError,
    ValidationError,
    AuthenticationError
};

// Example usage
/*
const example = async () => {
    try {
        await crystalBankClient.initialize();
        await crystalBankClient.login();

        await crystalBankClient.registerPlayer("player1");
        await crystalBankClient.depositCrystals("player1", "Type1", 10);
        await crystalBankClient.convertCrystalsToFUDDY("player1");

        await crystalBankClient.logout();
    } catch (error) {
        if (error instanceof AuthenticationError) {
            console.error("Authentication failed:", error);
        } else if (error instanceof ValidationError) {
            console.error("Invalid input:", error);
        } else if (error instanceof CrystalBankError) {
            console.error("Operation failed:", error);
        } else {
            console.error("Unexpected error:", error);
        }
    }
};
*/
