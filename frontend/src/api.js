import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as CrystalBankIDL } from "./declarations/CrystalBank";
import { idlFactory as FuddyToCrystalConversionIDL } from "./declarations/FuddyToCrystalConversion";

// Use the environment variable for the canister ID, defaulting to the local canister ID for development
const crystalBankCanisterId = process.env.REACT_APP_CRYSTAL_BANK_CANISTER_ID || "rrkah-fqaaa-aaaaa-aaaaq-cai";
const fuddyToCrystalConversionCanisterId = process.env.REACT_APP_FUDDY_TO_CRYSTAL_CONVERSION_CANISTER_ID || "ryjl3-tyaaa-aaaaa-aaaba-cai";

// Create a reusable actor for the Crystal Bank canister
const createActor = (canisterId, idl, options) => {
    const agent = new HttpAgent(options);
    if (process.env.NODE_ENV === "development") {
        agent.fetchRootKey(); // Fetch the root key for local development
    }
    return Actor.createActor(idl, { agent, canisterId });
};

// Create the actor for the local replica (or production if set)
export const crystalBank = createActor(crystalBankCanisterId, CrystalBankIDL, {
    host: process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://ic0.app",
});

export const fuddyToCrystalConversion = createActor(fuddyToCrystalConversionCanisterId, FuddyToCrystalConversionIDL, {
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

// New API functions for Fuddy to Crystal conversion
export const convertFuddyToCrystals = async (playerId, crystalType, amount) => {
    try {
        return await fuddyToCrystalConversion.convertFuddyToCrystals(playerId, crystalType, amount);
    } catch (error) {
        console.error("Error converting FUDDY to crystals:", error);
        throw error;
    }
};

export const updateConversionRate = async (crystalType, newRate) => {
    try {
        return await fuddyToCrystalConversion.updateConversionRate(crystalType, newRate);
    } catch (error) {
        console.error("Error updating conversion rate:", error);
        throw error;
    }
};

export const getConversionRates = async () => {
    try {
        return await fuddyToCrystalConversion.getConversionRates();
    } catch (error) {
        console.error("Error fetching conversion rates:", error);
        throw error;
    }
};
