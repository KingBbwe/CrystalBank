import React, { useState } from 'react';
import { registerPlayer, removePlayer, distributeCrystals } from './api'; // API calls to smart contracts

function GMPortal() {
    const [playerId, setPlayerId] = useState('');
    const [amount, setAmount] = useState(0);

    const handleRegister = async () => {
        const result = await registerPlayer(playerId);
        alert(result.message || 'Player registered successfully');
    };

    const handleRemove = async () => {
        const result = await removePlayer(playerId);
        alert(result.message || 'Player removed successfully');
    };

    const handleDistribute = async () => {
        const result = await distributeCrystals(playerId, amount);
        alert(result.message || 'Crystals distributed successfully');
    };

    return (
        <div>
            <h1>GM Portal - The Crystal Bank</h1>

            <div>
                <h2>Register Player</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <button onClick={handleRegister}>Register</button>
            </div>

            <div>
                <h2>Remove Player</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <button onClick={handleRemove}>Remove</button>
            </div>

            <div>
                <h2>Distribute Crystals</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <button onClick={handleDistribute}>Distribute</button>
            </div>
        </div>
    );
}

export default GMPortal;

