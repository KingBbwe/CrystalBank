import { createActor } from './agent'; // Assume ICP agent setup here

const crystalBank = createActor('your-canister-id');

export const registerPlayer = async (playerId) => {
    return await crystalBank.registerPlayer(playerId);
};

export const depositCrystals = async (playerId, crystalType, amount) => {
    return await crystalBank.depositCrystals(playerId, crystalType, amount);
};

export const convertCrystalsToFUDDY = async (playerId) => {
    return await crystalBank.convertCrystalsToFUDDY(playerId);
};

// Add other backend methods here

