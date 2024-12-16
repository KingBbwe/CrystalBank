import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory as crystalBankIdl, canisterId as crystalBankCanisterId } from "./declarations/CrystalBank";
import { idlFactory as fuddyTransferIdl, canisterId as fuddyTransferCanisterId } from "./declarations/FUDDYTransfer";

// Initialize the agents and actors
const agent = new HttpAgent();

// Ensure the agent points to the Internet Computer environment (local or mainnet)
const crystalBankActor = Actor.createActor(crystalBankIdl, {
  agent,
  canisterId: crystalBankCanisterId,
});
const fuddyTransferActor = Actor.createActor(fuddyTransferIdl, {
  agent,
  canisterId: fuddyTransferCanisterId,
});

// Register a player
async function registerPlayer() {
  const playerId = document.getElementById("playerId").value;

  if (!playerId) {
    alert("Please enter a Player ID.");
    return;
  }

  try {
    await crystalBankActor.registerPlayer(playerId);
    alert(`Player ${playerId} registered successfully!`);
  } catch (error) {
    console.error("Error registering player:", error);
    alert("Failed to register the player. Please check the console for details.");
  }
}

// Deposit crystals
async function depositCrystals() {
  const playerId = document.getElementById("playerId").value;
  const crystalType = document.getElementById("crystalType").value;
  const amount = parseInt(document.getElementById("amount").value, 10);

  if (!playerId || !crystalType || isNaN(amount) || amount <= 0) {
    alert("Please provide valid input for all fields.");
    return;
  }

  try {
    await crystalBankActor.depositCrystals(playerId, crystalType, amount);
    alert(`${amount} ${crystalType} crystals deposited for Player ${playerId}.`);
  } catch (error) {
    console.error("Error depositing crystals:", error);
    alert("Failed to deposit crystals. Please check the console for details.");
  }
}

// Transfer FUDDY
async function transferFuddy() {
  const fromPlayerId = document.getElementById("fromPlayerId").value;
  const toPlayerId = document.getElementById("toPlayerId").value;
  const amount = parseInt(document.getElementById("transferAmount").value, 10);

  if (!fromPlayerId || !toPlayerId || isNaN(amount) || amount <= 0) {
    alert("Please provide valid input for all fields.");
    return;
  }

  try {
    await fuddyTransferActor.transferFunds(fromPlayerId, toPlayerId, amount);
    alert(`Successfully transferred ${amount} FUDDY from Player ${fromPlayerId} to Player ${toPlayerId}.`);
  } catch (error) {
    console.error("Error transferring FUDDY:", error);
    alert("Failed to transfer FUDDY. Please check the console for details.");
  }
}

// Expose functions to global scope
window.registerPlayer = registerPlayer;
window.depositCrystals = depositCrystals;
window.transferFuddy = transferFuddy;
