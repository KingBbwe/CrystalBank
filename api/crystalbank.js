import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as CrystalBankIDL } from './declarations/CrystalBank';

const canisterId = process.env.REACT_APP_CRYSTAL_BANK_CANISTER_ID;

// Create a new actor for interacting with the Crystal Bank canister
export const createActor = (canisterId, options) => {
    const agent = new HttpAgent(options);
    return Actor.createActor(CrystalBankIDL, { agent, canisterId });
};

export const crystalBank = createActor(canisterId, { host: 'https://ic0.app' });

// API methods for frontend interaction
export const registerPlayer = async (playerId) => {
    try {
        return await crystalBank.registerPlayer(playerId);
    } catch (error) {
        console.error('Error registering player:', error);
    }
};

export const depositCrystals = async (playerId, crystalType, amount) => {
    try {
        return await crystalBank.depositCrystals(playerId, crystalType, amount);
    } catch (error) {
        console.error('Error depositing crystals:', error);
    }
};

export const convertCrystalsToFUDDY = async (playerId) => {
    try {
        return await crystalBank.convertCrystalsToFUDDY(playerId);
    } catch (error) {
        console.error('Error converting crystals:', error);
    }
};

export const getTransactionHistory = async (playerId) => {
    try {
        return await crystalBank.getPlayerTransactions(playerId);
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
};
