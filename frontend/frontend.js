// frontend.js

// Import necessary libraries
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as crystalBankIdl } from './declarations/CrystalBank'; // Adjust the path as necessary
import { idlFactory as fuddyTransferIdl } from './declarations/FUDDYTransfer';
import { idlFactory as hybridWalletIdl } from './declarations/HybridWallet';
import { idlFactory as blockchainWalletIdl } from './declarations/BlockchainWallet';
import { idlFactory as fuddyConversionIdl } from './declarations/FuddyConversion';

// Define the canister IDs (replace with your actual deployed canister IDs)
const crystalBankCanisterId = "ryjl3-tyaaa-aaaaa-aaaba-cai"; // Example ID for CrystalBank
const fuddyTransferCanisterId = "abcd1-qaaaa-aaaab-aaaac-cai"; // Example ID for FUDDYTransfer
const hybridWalletCanisterId = "efgh2-qaaaa-aaaab-aaaac-cai"; // Example ID for HybridWallet
const blockchainWalletCanisterId = "ijkl3-qaaaa-aaaab-aaaac-cai"; // Example ID for BlockchainWallet
const fuddyConversionCanisterId = "mnop4-qaaaa-aaaab-aaaac-cai"; // Example ID for FuddyConversion

// Create an agent to communicate with the Internet Computer
const agent = new HttpAgent();

// Create actor instances for each canister
const crystalBankActor = Actor.createActor(crystalBankIdl, {
    agent,
    canisterId: crystalBankCanisterId,
});

const fuddyTransferActor = Actor.createActor(fuddyTransferIdl, {
    agent,
    canisterId: fuddyTransferCanisterId,
});

const hybridWalletActor = Actor.createActor(hybridWalletIdl, {
    agent,
    canisterId: hybridWalletCanisterId,
});

const blockchainWalletActor = Actor.createActor(blockchainWalletIdl, {
    agent,
    canisterId: blockchainWalletCanisterId,
});

const fuddyConversionActor = Actor.createActor(fuddyConversionIdl, {
    agent,
    canisterId: fuddyConversionCanisterId,
});

// Function to register a new player
async function registerPlayer(playerId) {
    try {
        const result = await crystalBankActor.registerPlayer(playerId);
        console.log("Registration successful:", result);
    } catch (error) {
        console.error("Error registering player:", error);
    }
}

// Function to deposit crystals
async function depositCrystals(playerId, crystalType, amount) {
    try {
        const result = await crystalBankActor.depositCrystals(playerId, crystalType, amount);
        console.log("Deposit successful:", result);
    } catch (error) {
        console.error("Error depositing crystals:", error);
    }
}

// Function to convert crystals to FUDDY
async function convertCrystalsToFUDDY(playerId) {
    try {
        const result = await crystalBankActor.convertCrystalsToFUDDY(playerId);
        console.log("Conversion successful:", result);
    } catch (error) {
        console.error("Error converting crystals:", error);
    }
}

// Function to transfer FUDDY
async function transferFuddy(fromPlayerId, toPlayerId, amount) {
    try {
        const result = await fuddyTransferActor.transferFunds(fromPlayerId, toPlayerId, amount);
        console.log("Transfer successful:", result);
    } catch (error) {
        console.error("Error transferring FUDDY:", error);
    }
}

// Function to deposit real $FUDDY
async function depositRealFuddy(playerId, amount) {
    try {
        const result = await hybridWalletActor.depositRealFuddy(playerId, amount);
        console.log("Real $FUDDY deposit successful:", result);
    } catch (error) {
        console.error("Error depositing real $FUDDY:", error);
    }
}

// Function to convert in-game FUDDY to blockchain $FUDDY
async function convertToBlockchain(playerId, amount) {
    try {
        const result = await fuddyConversionActor.convertToBlockchain(playerId, amount);
        console.log("Conversion to blockchain $FUDDY successful:", result);
    } catch (error) {
        console.error("Error converting to blockchain $FUDDY:", error);
    }
}

// Function to get player balances
async function getBalances(playerId) {
    try {
        const result = await hybridWalletActor.getBalances(playerId);
        console.log(`Balances for player ${playerId}:`, result);
    } catch (error) {
        console.error("Error fetching balances:", error);
    }
}

// Example usage of the functions
(async () => {
    const playerId = "player1";

    // Register a player
    await registerPlayer(playerId);

    // Deposit crystals
    await depositCrystals(playerId, "Type1", 10);

    // Convert crystals to FUDDY
    await convertCrystalsToFUDDY(playerId);

    // Transfer FUDDY between players
    await transferFuddy("player1", "player2", 5);

    // Deposit real $FUDDY
    await depositRealFuddy(playerId, 100);

    // Convert in-game FUDDY to blockchain $FUDDY
    await convertToBlockchain(playerId, 50);

    // Get player balances
    await getBalances(playerId);
})();
