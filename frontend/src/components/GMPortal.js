// File: GMPortal.js
import React, { useState } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as MacroManagerIDL } from '../declarations/MacroManager'; // Import the IDL of MacroManager

const CANISTER_ID = 'your-canister-id'; // Replace with the MacroManager canister ID

function GMPortal() {
    const [playerId, setPlayerId] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [amount, setAmount] = useState(0);

    // Setup Internet Computer agent and actor
    const agent = new HttpAgent(); // Defaults to IC mainnet
    const macroManager = Actor.createActor(MacroManagerIDL, { agent, canisterId: CANISTER_ID });

    // Register a player (unchanged)
    const handleRegisterPlayer = async () => {
        try {
            const result = await macroManager.registerPlayer(playerId);
            alert(result ? 'Player registered successfully' : 'Player registration failed');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Distribute Crystals (unchanged)
    const handleDistributeCrystals = async () => {
        try {
            const result = await macroManager.depositCrystals(playerId, 'Type1', amount);
            alert(result ? 'Crystals distributed successfully' : 'Distribution failed');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Transfer Real $FUDDY
    const handleTransferFuddy = async () => {
        try {
            const result = await macroManager.transferRealFuddy(recipientId, amount);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Convert In-Game $FUDDY to Real $FUDDY
    const handleConvertFuddy = async () => {
        try {
            const result = await macroManager.convertToRealFuddy(amount);
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
                    onChange={(e) => setRecipientId(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    onChange={(e) => setAmount(Number(e.target.value))}
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
