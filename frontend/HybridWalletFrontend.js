import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { idlFactory } from "./declarations/hybrid_wallet.did.js"; // You'll need to generate this

class HybridWalletFrontend {
    constructor() {
        this.agent = null;
        this.actor = null;
        this.isInitialized = false;
    }

    async initialize(canisterId) {
        try {
            // Create an agent for connecting to the IC network
            this.agent = new HttpAgent({
                host: "https://ic0.app", // mainnet
                // host: "http://localhost:4943", // local
            });

            // Create an actor with the canister interface
            this.actor = Actor.createActor(idlFactory, {
                agent: this.agent,
                canisterId,
            });

            this.isInitialized = true;
            console.log("HybridWallet frontend initialized successfully");
        } catch (error) {
            console.error("Failed to initialize HybridWallet frontend:", error);
            throw error;
        }
    }

    // Helper function to check initialization
    checkInitialization() {
        if (!this.isInitialized) {
            throw new Error("HybridWallet frontend not initialized. Call initialize() first.");
        }
    }

    // Helper function to handle results
    handleResult(result) {
        if ('ok' in result) {
            return { success: true, data: result.ok };
        } else {
            return { success: false, error: result.err };
        }
    }

    /**
     * Deposit real FUDDY into a player's wallet
     * @param {string} playerId - The ID of the player
     * @param {number} amount - Amount of FUDDY to deposit
     * @returns {Promise<Object>} Result of the deposit operation
     */
    async depositRealFuddy(playerId, amount) {
        this.checkInitialization();
        try {
            const result = await this.actor.depositRealFuddy(playerId, BigInt(amount));
            return this.handleResult(result);
        } catch (error) {
            console.error("Error depositing real FUDDY:", error);
            throw error;
        }
    }

    /**
     * Transfer real FUDDY between players
     * @param {string} fromPlayerId - Sender's player ID
     * @param {string} toPlayerId - Receiver's player ID
     * @param {number} amount - Amount to transfer
     * @returns {Promise<Object>} Result of the transfer operation
     */
    async transferRealFuddy(fromPlayerId, toPlayerId, amount) {
        this.checkInitialization();
        try {
            const result = await this.actor.transferRealFuddy(fromPlayerId, toPlayerId, BigInt(amount));
            return this.handleResult(result);
        } catch (error) {
            console.error("Error transferring real FUDDY:", error);
            throw error;
        }
    }

    /**
     * Convert real FUDDY to in-game FUDDY
     * @param {string} playerId - The ID of the player
     * @param {number} amount - Amount to convert
     * @returns {Promise<Object>} Result of the conversion operation
     */
    async convertToInGameFuddy(playerId, amount) {
        this.checkInitialization();
        try {
            const result = await this.actor.convertToInGameFuddy(playerId, BigInt(amount));
            return this.handleResult(result);
        } catch (error) {
            console.error("Error converting to in-game FUDDY:", error);
            throw error;
        }
    }

    /**
     * Spend in-game FUDDY
     * @param {string} playerId - The ID of the player
     * @param {number} amount - Amount to spend
     * @returns {Promise<Object>} Result of the spending operation
     */
    async spendInGameFuddy(playerId, amount) {
        this.checkInitialization();
        try {
            const result = await this.actor.spendInGameFuddy(playerId, BigInt(amount));
            return this.handleResult(result);
        } catch (error) {
            console.error("Error spending in-game FUDDY:", error);
            throw error;
        }
    }

    /**
     * Get wallet balances for a player
     * @param {string} playerId - The ID of the player
     * @returns {Promise<Object>} Player's wallet balances
     */
    async getBalances(playerId) {
        this.checkInitialization();
        try {
            const result = await this.actor.getBalances(playerId);
            return this.handleResult(result);
        } catch (error) {
            console.error("Error getting balances:", error);
            throw error;
        }
    }
}

// Example usage:
const usage = async () => {
    const wallet = new HybridWalletFrontend();
    const canisterId = "YOUR_CANISTER_ID_HERE"; // Replace with your actual canister ID
    
    try {
        // Initialize the frontend
        await wallet.initialize(canisterId);

        // Example operations
        const depositResult = await wallet.depositRealFuddy("player1", 100);
        console.log("Deposit result:", depositResult);

        const transferResult = await wallet.transferRealFuddy("player1", "player2", 50);
        console.log("Transfer result:", transferResult);

        const convertResult = await wallet.convertToInGameFuddy("player1", 25);
        console.log("Conversion result:", convertResult);

        const balances = await wallet.getBalances("player1");
        console.log("Player balances:", balances);

    } catch (error) {
        console.error("Error in wallet operations:", error);
    }
};

export default HybridWalletFrontend;
