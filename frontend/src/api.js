import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as CrystalBankIDL } from "./declarations/CrystalBank";

// Use the environment variable for the canister ID, defaulting to the local canister ID for development
const canisterId = process.env.REACT_APP_CRYSTAL_BANK_CANISTER_ID || "rrkah-fqaaa-aaaaa-aaaaq-cai";

// Create a reusable actor for the Crystal Bank canister
const createActor = (canisterId, options) => {
    const agent = new HttpAgent(options);
    if (process.env.NODE_ENV === "development") {
        agent.fetchRootKey(); // Fetch the root key for local development
    }
    return Actor.createActor(CrystalBankIDL, { agent, canisterId });
};

// Create the actor for the local replica (or production if set)
export const crystalBank = createActor(canisterId, {
    host: process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://ic0.app",
});

// API functions

export const registerPlayer = async (playerId) => {
    try {
        return await crystalBank.registerPlayer(playerId);
    } catch (error) {
        console.error("Error registering player:", error);
        throw error;
    }
};

export const isPlayerRegistered = async (playerId) => {
    try {
        return await crystalBank.isRegistered(playerId);
    } catch (error) {
        console.error("Error checking registration:", error);
        throw error;
    }
};

export const depositCrystals = async (playerId, crystalType, amount) => {
    try {
        return await crystalBank.depositCrystals(playerId, crystalType, amount);
    } catch (error) {
        console.error("Error depositing crystals:", error);
        throw error;
    }
};

export const convertCrystalsToFUDDY = async (playerId) => {
    try {
        return await crystalBank.convertCrystalsToFUDDY(playerId);
    } catch (error) {
        console.error("Error converting crystals:", error);
        throw error;
    }
};

export const getTransactionHistory = async (playerId) => {
    try {
        return await crystalBank.getPlayerTransactions(playerId);
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        throw error;
    }
};

export const transferFunds = async (fromPlayerId, toPlayerId, amount) => {
    try {
        return await crystalBank.transferFunds(fromPlayerId, toPlayerId, amount);
    } catch (error) {
        console.error("Error transferring funds:", error);
        throw error;
    }
};

export const getBalance = async (playerId) => {
    try {
        return await crystalBank.getBalance(playerId);
    } catch (error) {
        console.error("Error fetching balance:", error);
        throw error;
    }
};
