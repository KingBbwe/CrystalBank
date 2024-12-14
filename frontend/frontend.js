// frontend.js

// Import necessary libraries
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as crystalBankIdl } from './declarations/CrystalBank'; // Adjust the path as necessary

// Define the canister ID (replace with your actual canister ID)
const crystalBankCanisterId = "rrkah-fqaaa-aaaaa-aaaaq-cai"; // Replace with your deployed canister ID

// Create an agent to communicate with the Internet Computer
const agent = new HttpAgent();

// Create an actor instance for the CrystalBank canister
const crystalBankActor = Actor.createActor(crystalBankIdl, {
    agent,
    canisterId: crystalBankCanisterId,
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

// Example usage of the functions
registerPlayer("player1");
depositCrystals("player1", "Type1", 10);
convertCrystalsToFUDDY("player1");
