import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as HybridWalletIDL } from './declarations/HybridWallet';

// Set up the canister ID
const canisterId = process.env.REACT_APP_HYBRID_WALLET_CANISTER_ID;

// Create a new actor to interact with the Hybrid Wallet canister
export const createActor = (canisterId, options) => {
    const agent = new HttpAgent(options);
    return Actor.createActor(HybridWalletIDL, { agent, canisterId });
};

export const hybridWallet = createActor(canisterId, { host: 'https://ic0.app' });

// API methods for frontend interaction

/**
 * Deposit real $FUDDY into a player's wallet.
 * @param {string} playerId - The player's unique identifier.
 * @param {number} amount - Amount of $FUDDY to deposit.
 * @returns {Promise<Result<string, string>>}
 */
export const depositRealFuddy = async (playerId, amount) => {
    try {
        return await hybridWallet.depositRealFuddy(playerId, BigInt(amount));
    } catch (error) {
        console.error('Error depositing real $FUDDY:', error);
        throw error;
    }
};

/**
 * Transfer real $FUDDY between wallets.
 * @param {string} from - Sender's player ID.
 * @param {string} to - Receiver's player ID.
 * @param {number} amount - Amount of $FUDDY to transfer.
 * @returns {Promise<Result<string, string>>}
 */
export const transferRealFuddy = async (from, to, amount) => {
    try {
        return await hybridWallet.transferRealFuddy(from, to, BigInt(amount));
    } catch (error) {
        console.error('Error transferring real $FUDDY:', error);
        throw error;
    }
};

/**
 * Convert real $FUDDY to in-game FUDDY.
 * @param {string} playerId - The player's unique identifier.
 * @param {number} amount - Amount to convert.
 * @returns {Promise<Result<string, string>>}
 */
export const convertToInGameFuddy = async (playerId, amount) => {
    try {
        return await hybridWallet.convertToInGameFuddy(playerId, BigInt(amount));
    } catch (error) {
        console.error('Error converting to in-game FUDDY:', error);
        throw error;
    }
};

/**
 * Spend in-game FUDDY.
 * @param {string} playerId - The player's unique identifier.
 * @param {number} amount - Amount to spend.
 * @returns {Promise<Result<string, string>>}
 */
export const spendInGameFuddy = async (playerId, amount) => {
    try {
        return await hybridWallet.spendInGameFuddy(playerId, BigInt(amount));
    } catch (error) {
        console.error('Error spending in-game FUDDY:', error);
        throw error;
    }
};

/**
 * Fetch a player's wallet balances.
 * @param {string} playerId - The player's unique identifier.
 * @returns {Promise<Result<{ inGameFuddy: bigint; realFuddy: bigint; }, string>>}
 */
export const getBalances = async (playerId) => {
    try {
        return await hybridWallet.getBalances(playerId);
    } catch (error) {
        console.error('Error fetching wallet balances:', error);
        throw error;
    }
};
