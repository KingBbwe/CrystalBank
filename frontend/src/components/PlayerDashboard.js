import React, { useState } from 'react';
import {
    depositCrystals,
    convertCrystalsToFUDDY,
    transferFunds,
    buyFUDDY,
    getTransactionHistory,
} from './api'; // API calls to smart contracts

function PlayerDashboard() {
    const [playerId, setPlayerId] = useState('');
    const [crystalType, setCrystalType] = useState('');
    const [amount, setAmount] = useState(0);
    const [recipientId, setRecipientId] = useState('');
    const [history, setHistory] = useState([]);

    const handleDeposit = async () => {
        const result = await depositCrystals(playerId, crystalType, amount);
        alert(result.message || 'Crystals deposited successfully');
    };

    const handleConvert = async () => {
        const result = await convertCrystalsToFUDDY(playerId);
        alert(result.message || `Converted successfully: ${result.amount} $FUDDY`);
    };

    const handleTransfer = async () => {
        const result = await transferFunds(playerId, recipientId, amount);
        alert(result.message || 'Transfer successful');
    };

    const handleBuy = async () => {
        const result = await buyFUDDY(playerId, amount);
        alert(result.message || 'Purchased $FUDDY successfully');
    };

    const handleHistory = async () => {
        const result = await getTransactionHistory(playerId);
        setHistory(result || []);
    };

    return (
        <div>
            <h1>Player Dashboard - The Crystal Bank</h1>

            <div>
                <h2>Deposit Crystals</h2>
                <input type="text" placeholder="Player ID" onChange={(e) => setPlayerId(e.target.value)} />
                <select onChange={(e) => setCrystalType(e.target.value)}>
                    <option value="">Select Crystal Type</option>
                    <option value="Type1">Type 1</option>
                    <option value="Type2">Type 2</option>
                    <option value="Type3">Type 3</option>
                    <option value="Type4">Type 4</option>
                </select>
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <button onClick={handleDeposit}>Deposit</button>
            </div>

            <div>
                <h2>Convert to $FUDDY</h2>
                <button onClick={handleConvert}>Convert</button>
            </div>

            <div>
                <h2>Transfer $FUDDY</h2>
                <input type="text" placeholder="Recipient ID" onChange={(e) => setRecipientId(e.target.value)} />
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <button onClick={handleTransfer}>Transfer</button>
            </div>

            <div>
                <h2>Buy $FUDDY</h2>
                <input type="number" placeholder="Amount" onChange={(e) => setAmount(Number(e.target.value))} />
                <button onClick={handleBuy}>Buy</button>
            </div>

            <div>
                <h2>Transaction History</h2>
                <button onClick={handleHistory}>View History</button>
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

