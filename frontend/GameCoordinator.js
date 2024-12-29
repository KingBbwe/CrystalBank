import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as GameCoordinatorIDL } from '../declarations/GameCoordinator'; // Import the IDL of GameCoordinator

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

    // Transfer Crystals
    async transferCrystals(fromPlayerId, toPlayerId, crystalType, amount) {
        try {
            const result = await this.gameCoordinator.transferCrystals(fromPlayerId, toPlayerId, crystalType, amount);
            return result;
        } catch (error) {
            console.error('Error transferring crystals:', error);
            throw error;
        }
    }

    // Distribute Crystals (GM only)
    async distributeCrystals(playerId, crystalType, amount) {
        try {
            const result = await this.gameCoordinator.distributeCrystals(playerId, crystalType, amount);
            return result;
        } catch (error) {
            console.error('Error distributing crystals:', error);
            throw error;
        }
    }

    // Deposit FUDDY
    async depositFuddy(playerId, amount) {
        try {
            const result = await this.gameCoordinator.depositFuddy(playerId, amount);
            return result;
        } catch (error) {
            console.error('Error depositing FUDDY:', error);
            throw error;
        }
    }

    // Withdraw FUDDY
    async withdrawFuddy(playerId, amount) {
        try {
            const result = await this.gameCoordinator.withdrawFuddy(playerId, amount);
            return result;
        } catch (error) {
            console.error('Error withdrawing FUDDY:', error);
            throw error;
        }
    }

    // Transfer FUDDY
    async transferFuddy(fromPlayerId, toPlayerId, amount) {
        try {
            const result = await this.gameCoordinator.transferFuddy(fromPlayerId, toPlayerId, amount);
            return result;
        } catch (error) {
            console.error('Error transferring FUDDY:', error);
            throw error;
        }
    }

    // Convert FUDDY to Blockchain
    async convertFuddyToBlockchain(playerId, amount) {
        try {
            const result = await this.gameCoordinator.convertFuddyToBlockchain(playerId, amount);
            return result;
        } catch (error) {
            console.error('Error converting FUDDY to blockchain:', error);
            throw error;
        }
    }

    // Get FUDDY Balance
    async getFuddyBalance(playerId) {
        try {
            const result = await this.gameCoordinator.getFuddyBalance(playerId);
            return result;
        } catch (error) {
            console.error('Error fetching FUDDY balance:', error);
            throw error;
        }
    }
}

export default new GameCoordinator();
