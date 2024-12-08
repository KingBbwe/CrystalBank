import React, { useState } from 'react';
import { depositCrystals, convertCrystalsToFUDDY, getTransactionHistory } from '../api/crystalBank';

function PlayerDashboard() {
    const [playerId, setPlayerId] = useState('');
    const [crystalType, setCrystalType] = useState('');
    const [amount, setAmount] = useState(0);
    const [history, setHistory] = useState([]);

    const handleDepositCrystals = async () => {
        const result = await depositCrystals(playerId, crystalType, amount);
        alert(result ? 'Crystals deposited successfully' : 'Deposit failed');
    };

    const handleConvertToFUDDY = async () => {
        const result = await convertCrystalsToFUDDY(playerId);
        alert(result ? `Conversion successful: ${result} $FUDDY` : 'Conversion failed');
    };

    const handleFetchHistory = async () => {
        const result = await getTransactionHistory(playerId);
        setHistory(result || []);
    };

    return (
        <div>
            <h1>Player Dashboard</h1>
            <div>
                <h2>Deposit Crystals</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <select onChange={(e) => setCrystalType(e.target.value)}>
                    <option value="">Select Crystal Type</option>
                    <option value="Type1">Type 1</option>
                    <option value="Type2">Type 2</option>
                </select>
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <button onClick={handleDepositCrystals}>Deposit</button>
            </div>
            <div>
                <h2>Convert to $FUDDY</h2>
                <button onClick={handleConvertToFUDDY}>Convert</button>
            </div>
            <div>
                <h2>Transaction History</h2>
                <button onClick={handleFetchHistory}>Fetch History</button>
                <ul>
                    {history.map((record, index) => (
                        <li key={index}>{JSON.stringify(record)}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PlayerDashboard;
