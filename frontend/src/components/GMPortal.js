import React, { useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as GameCoordinatorIDL } from '../declarations/GameCoordinator'; // Import the IDL of GameCoordinator

const CANISTER_ID = 'your-canister-id'; // Replace with the GameCoordinator canister ID

function GMPortal() {
    const [playerId, setPlayerId] = useState('');
    const [crystalType, setCrystalType] = useState('');
    const [amount, setAmount] = useState(0);
    const [transferTarget, setTransferTarget] = useState('');
    const [transferAmount, setTransferAmount] = useState(0);

    // Setup Internet Computer agent and actor
    const agent = new HttpAgent(); // Defaults to IC mainnet
    const gameCoordinator = Actor.createActor(GameCoordinatorIDL, { agent, canisterId: CANISTER_ID });

    // Register a player (GM only)
    const handleRegisterPlayer = async () => {
        try {
            const result = await gameCoordinator.registerPlayer(playerId);
            alert(result ? 'Player registered successfully' : 'Player registration failed');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Distribute Crystals (GM only)
    const handleDistributeCrystals = async () => {
        try {
            const result = await gameCoordinator.distributeCrystals(playerId, crystalType, amount);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Transfer FUDDY (GM only)
    const handleTransferFuddy = async () => {
        try {
            const result = await gameCoordinator.transferFuddy(playerId, transferTarget, transferAmount);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Convert In-Game FUDDY to Real FUDDY (GM only)
    const handleConvertFuddy = async () => {
        try {
            const result = await gameCoordinator.convertFuddyToBlockchain(playerId, amount);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>GM Portal</h1>

            {/* Register Player */}
            <div>
                <h2>Register Player</h2>
                <input
                    type="text"
                    placeholder="Player ID"
                    onChange={(e) => setPlayerId(e.target.value)}
                />
                <button onClick={handleRegisterPlayer}>Register</button>
            </div>

            {/* Distribute Crystals */}
            <div>
                <h2>Distribute Crystals</h2>
                <input
                    type="text"
                    placeholder="Player ID"
                    onChange={(e) => setPlayerId(e.target.value)}
                />
                <select onChange={(e) => setCrystalType(e.target.value)}>
                    <option value="">Select Crystal Type</option>
                    <option value="Type1">Type 1</option>
                    <option value="Type2">Type 2</option>
                    <option value="Type3">Type 3</option>
                    <option value="Type4">Type 4</option>
                </select>
                <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleDistributeCrystals}>Distribute</button>
            </div>

            {/* Transfer Real $FUDDY */}
            <div>
                <h2>Transfer Real $FUDDY</h2>
                <input
                    type="text"
                    placeholder="Recipient ID"
                    onChange={(e) => setTransferTarget(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                />
                <button onClick={handleTransferFuddy}>Transfer</button>
            </div>

            {/* Convert In-Game $FUDDY */}
            <div>
                <h2>Convert In-Game $FUDDY</h2>
                <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleConvertFuddy}>Convert</button>
            </div>
        </div>
    );
}

export default GMPortal;
