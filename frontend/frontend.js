import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

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
    RETRY_DELAY: 1000,
    RATE_LIMIT: {
        windowMs: 60000,
        maxRequests: 30
    }
};

// Rate limiter implementation
class RateLimiter {
    constructor(windowMs, maxRequests) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.requests = new Map();
    }

    async checkLimit(key) {
        const now = Date.now();
        const windowStart = now - this.windowMs;
        
        this.requests.forEach((timestamp, reqKey) => {
            if (timestamp < windowStart) {
                this.requests.delete(reqKey);
            }
        });

        const requestCount = Array.from(this.requests.values())
            .filter(timestamp => timestamp > windowStart)
            .length;

        if (requestCount >= this.maxRequests) {
            throw new CrystalBankError('Rate limit exceeded', 'RATE_LIMIT_ERROR');
        }

        this.requests.set(`${key}-${now}`, now);
    }
}

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

function isRetryableError(error) {
    return error.message.includes('network') || 
           error.message.includes('timeout') ||
           error.code === 'IC0503';
}

class CrystalBankClient {
    constructor() {
        this.agent = null;
        this.actor = null;
        this.authClient = null;
        this.isInitialized = false;
        this.rateLimiter = new RateLimiter(
            CONFIG.RATE_LIMIT.windowMs,
            CONFIG.RATE_LIMIT.maxRequests
        );
    }

    async initialize() {
        if (this.isInitialized) return;

        this.authClient = await AuthClient.create();
        
        this.agent = new HttpAgent({
            host: CONFIG.HOST,
            identity: this.authClient.getIdentity()
        });

        if (process.env.NODE_ENV !== "production") {
            await this.agent.fetchRootKey();
        }

        this.actor = Actor.createActor(crystalBankIdl, {
            agent: this.agent,
            canisterId: CONFIG.CANISTER_ID
        });

        this.isInitialized = true;
    }

    async ensureAuthenticated() {
        if (!this.authClient) {
            throw new AuthenticationError('Client not initialized');
        }

        const isAuthenticated = await this.authClient.isAuthenticated();
        if (!isAuthenticated) {
            throw new AuthenticationError('User not authenticated');
        }
    }

    async login() {
        await this.authClient.login({
            identityProvider: 'https://identity.ic0.app',
            onSuccess: () => {
                this.agent.replaceIdentity(this.authClient.getIdentity());
            }
        });
    }

    async logout() {
        await this.authClient.logout();
        this.agent.replaceIdentity(await AuthClient.getAnonymousIdentity());
    }

    // Player Registration Methods
    async registerPlayer(playerId) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`register-${playerId}`);
        
        return withRetry(async () => {
            try {
                return await this.actor.registerPlayer(playerId);
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to register player: ${error.message}`,
                    'REGISTRATION_ERROR'
                );
            }
        });
    }

    async isPlayerRegistered(playerId) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`check-registration-${playerId}`);
        
        return withRetry(async () => {
            try {
                return await this.actor.isPlayerRegistered(playerId);
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to check player registration: ${error.message}`,
                    'REGISTRATION_CHECK_ERROR'
                );
            }
        });
    }

    async removePlayer(playerId) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`remove-${playerId}`);
        
        return withRetry(async () => {
            try {
                return await this.actor.removePlayer(playerId);
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to remove player: ${error.message}`,
                    'REMOVE_PLAYER_ERROR'
                );
            }
        });
    }

    // Crystal Management Methods
    async depositCrystals(playerId, crystalType, amount) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`deposit-${playerId}`);
        
        if (!playerId || !crystalType || typeof amount !== 'number' || amount <= 0) {
            throw new ValidationError('Invalid parameters for crystal deposit');
        }

        return withRetry(async () => {
            try {
                const result = await this.actor.depositCrystals(playerId, crystalType, amount);
                if ('ok' in result) {
                    return result.ok;
                } else {
                    throw new Error(result.err);
                }
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to deposit crystals: ${error.message}`,
                    'DEPOSIT_ERROR'
                );
            }
        });
    }

    async convertCrystalsToFUDDY(playerId) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`convert-crystals-${playerId}`);
        
        return withRetry(async () => {
            try {
                const result = await this.actor.convertCrystalsToFUDDY(playerId);
                if ('ok' in result) {
                    return result.ok;
                } else {
                    throw new Error(result.err);
                }
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to convert crystals to FUDDY: ${error.message}`,
                    'CONVERSION_ERROR'
                );
            }
        });
    }

    // FUDDY Management Methods
    async transferFUDDY(fromPlayerId, toPlayerId, amount) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`transfer-${fromPlayerId}`);
        
        if (!fromPlayerId || !toPlayerId || typeof amount !== 'number' || amount <= 0) {
            throw new ValidationError('Invalid parameters for FUDDY transfer');
        }

        return withRetry(async () => {
            try {
                const result = await this.actor.transferFUDDY(fromPlayerId, toPlayerId, amount);
                if ('ok' in result) {
                    return result.ok;
                } else {
                    throw new Error(result.err);
                }
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to transfer FUDDY: ${error.message}`,
                    'TRANSFER_ERROR'
                );
            }
        });
    }

    async getBalance(playerId) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`balance-${playerId}`);
        
        return withRetry(async () => {
            try {
                return await this.actor.getBalance(playerId);
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to get balance: ${error.message}`,
                    'BALANCE_ERROR'
                );
            }
        });
    }

    async buyFUDDY(playerId, amount) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`buy-${playerId}`);
        
        if (!playerId || typeof amount !== 'number' || amount <= 0) {
            throw new ValidationError('Invalid parameters for FUDDY purchase');
        }

        return withRetry(async () => {
            try {
                const result = await this.actor.buyFUDDY(playerId, amount);
                if ('ok' in result) {
                    return result.ok;
                } else {
                    throw new Error(result.err);
                }
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to buy FUDDY: ${error.message}`,
                    'PURCHASE_ERROR'
                );
            }
        });
    }

    // Transaction History Methods
    async getTransactionHistory() {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit('transaction-history');
        
        return withRetry(async () => {
            try {
                return await this.actor.getTransactionHistory();
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to get transaction history: ${error.message}`,
                    'HISTORY_ERROR'
                );
            }
        });
    }

    async getPlayerTransactions(playerId) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`player-transactions-${playerId}`);
        
        return withRetry(async () => {
            try {
                return await this.actor.getPlayerTransactions(playerId);
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to get player transactions: ${error.message}`,
                    'PLAYER_HISTORY_ERROR'
                );
            }
        });
    }

    // Economic Management Methods
    async updateConversionRate(crystalType, newRate) {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit(`update-rate-${crystalType}`);
        
        if (!crystalType || typeof newRate !== 'number' || newRate <= 0) {
            throw new ValidationError('Invalid parameters for conversion rate update');
        }

        return withRetry(async () => {
            try {
                return await this.actor.updateConversionRate(crystalType, newRate);
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to update conversion rate: ${error.message}`,
                    'RATE_UPDATE_ERROR'
                );
            }
        });
    }

    async getCurrentConversionRates() {
        await this.ensureAuthenticated();
        await this.rateLimiter.checkLimit('conversion-rates');
        
        return withRetry(async () => {
            try {
                return await this.actor.getCurrentConversionRates();
            } catch (error) {
                throw new CrystalBankError(
                    `Failed to get conversion rates: ${error.message}`,
                    'RATE_FETCH_ERROR'
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
