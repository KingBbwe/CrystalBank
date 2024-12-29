import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as GameCoordinatorIDL } from '../declarations/GameCoordinator';

const CANISTER_ID = 'your-canister-id'; // Replace with the GameCoordinator canister ID

class GameCoordinator {
    constructor() {
        this.agent = new HttpAgent(); // Defaults to IC mainnet
        this.gameCoordinator = Actor.createActor(GameCoordinatorIDL, { agent: this.agent, canisterId: CANISTER_ID });
    }

    // Player Registration
    async registerPlayer(playerId) {
        try {
            const result = await this.gameCoordinator.registerPlayer(playerId);
            return result;
        } catch (error) {
            console.error('Error registering player:', error);
            throw error;
        }
    }

    // Deposit Crystals
    async depositCrystals(playerId, crystalType, amount) {
        try {
            const result = await this.gameCoordinator.depositCrystals(playerId, crystalType, amount);
            return result;
        } catch (error) {
            console.error('Error depositing crystals:', error);
            throw error;
        }
    }

    // Convert Crystals to FUDDY
    async convertCrystalsToFUDDY(playerId) {
        try {
            const result = await this.gameCoordinator.convertCrystalsToFUDDY(playerId);
            return result;
        } catch (error) {
            console.error('Error converting crystals:', error);
            throw error;
        }
    }

    // Transfer FUDDY
    async transferFUDDY(fromPlayerId, toPlayerId, amount) {
        try {
            const result = await this.gameCoordinator.transferFUDDY(fromPlayerId, toPlayerId, amount);
            return result;
        } catch (error) {
            console.error('Error transferring FUDDY:', error);
            throw error;
        }
    }

    // Convert FUDDY to Crystals
    async convertFuddyToCrystals(playerId, crystalType, amount) {
        try {
            const result = await this.gameCoordinator.convertFuddyToCrystals(playerId, crystalType, amount);
            return result;
        } catch (error) {
            console.error('Error converting FUDDY to crystals:', error);
            throw error;
        }
    }

    // Update Conversion Rates (GM only)
    async updateConversionRate(crystalType, newRate) {
        try {
            const result = await this.gameCoordinator.updateConversionRate(crystalType, newRate);
            return result;
        } catch (error) {
            console.error('Error updating conversion rate:', error);
            throw error;
        }
    }

    // Get Conversion Rates
    async getConversionRates() {
        try {
            const result = await this.gameCoordinator.getConversionRates();
            return result;
        } catch (error) {
            console.error('Error fetching conversion rates:', error);
            throw error;
        }
    }
}

export default new GameCoordinator();
