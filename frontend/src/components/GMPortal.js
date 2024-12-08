import React, { useState } from 'react';
import { registerPlayer, depositCrystals } from '../api/crystalBank';

function GMPortal() {
    const [playerId, setPlayerId] = useState('');
    const [amount, setAmount] = useState(0);

    const handleRegisterPlayer = async () => {
        const result = await registerPlayer(playerId);
        alert(result ? 'Player registered successfully' : 'Player registration failed');
    };

    const handleDistributeCrystals = async () => {
        const result = await depositCrystals(playerId, 'Type1', amount);
        alert(result ? 'Crystals distributed successfully' : 'Distribution failed');
    };

    return (
        <div>
            <h1>GM Portal</h1>
            <div>
                <h2>Register Player</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <button onClick={handleRegisterPlayer}>Register</button>
            </div>
            <div>
                <h2>Distribute Crystals</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <button onClick={handleDistributeCrystals}>Distribute</button>
            </div>
        </div>
    );
}

export default GMPortal;
