import React, { useState, useEffect } from 'react';
import { getTransactionHistory } from '../api/crystalBank'; // Existing API for transaction history
import { handleDepositCrystals, handleConvertToFUDDY } from '../api/fuddy'; // Modular functions
import { hybridWallet } from '../api/hybridWallet'; // HybridWallet API for wallet interactions

function PlayerDashboard() {
    const [playerId, setPlayerId] = useState('');
    const [crystalType, setCrystalType] = useState('');
    const [amount, setAmount] = useState(0);
    const [history, setHistory] = useState([]);
    const [walletBalances, setWalletBalances] = useState({ inGameFuddy: 0, realFuddy: 0 }); // Hybrid Wallet Balances
    const [depositAmount, setDepositAmount] = useState(0); // Amount for real $FUDDY deposit
    const [transferTarget, setTransferTarget] = useState(''); // Target player ID for transfer
    const [transferAmount, setTransferAmount] = useState(0); // Amount to transfer real $FUDDY

    // Fetch wallet balances when playerId changes
    useEffect(() => {
        if (playerId) {
            const fetchBalances = async () => {
                try {
                    const balances = await hybridWallet.getBalances(playerId);
                    setWalletBalances(balances);
                } catch (error) {
                    console.error('Error fetching wallet balances:', error);
                }
            };
            fetchBalances();
        }
    }, [playerId]);

    // Handle crystal deposits using the modularized function
    const handleDepositCrystalsAction = async () => {
        const result = await handleDepositCrystals(playerId, crystalType, amount);
        alert(result);
    };

    // Handle FUDDY conversion with redundancy mechanism using the modularized function
    const handleConvertToFUDDYAction = async () => {
        const result = await handleConvertToFUDDY(playerId, amount, walletBalances.realFuddy);
        alert(result);
    };

    // Fetch Transaction History
    const handleFetchHistory = async () => {
        const result = await getTransactionHistory(playerId);
        setHistory(result || []);
    };

    // Deposit Real $FUDDY
    const handleDepositRealFuddy = async () => {
        try {
            const result = await hybridWallet.depositRealFuddy(playerId, depositAmount);
            if (result.ok) {
                alert('Deposit successful');
                setDepositAmount(0); // Reset input
                // Refresh balances after deposit
                const balances = await hybridWallet.getBalances(playerId);
                setWalletBalances(balances);
            } else {
                alert(`Deposit failed: ${result.err}`);
            }
        } catch (error) {
            alert('Error during deposit: ' + error.message);
        }
    };

    // Transfer Real $FUDDY
    const handleTransferFuddy = async () => {
        try {
            const result = await hybridWallet.transferRealFuddy(playerId, transferTarget, transferAmount);
            if (result.ok) {
                alert("Transfer successful!");
                setTransferTarget('');
                setTransferAmount(0);
                // Refresh balances after transfer
                const balances = await hybridWallet.getBalances(playerId);
                setWalletBalances(balances);
            } else {
                alert(`Transfer failed: ${result.err}`);
            }
        } catch (error) {
            alert("Error during transfer: " + error.message);
        }
    };

    return (
        <div>
            <h1>Player Dashboard</h1>
            <div>
                <label>
                    Player ID:
                    <input
                        type="text"
                        placeholder="Player ID"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                    />
                </label>
            </div>
            <div>
                <h2>Hybrid Wallet Balances</h2>
                <p>In-Game FUDDY: {walletBalances.inGameFuddy}</p>
                <p>Real $FUDDY: {walletBalances.realFuddy}</p>
            </div>
            <div>
                <h2>Deposit Real $FUDDY</h2>
                <input
                    type="number"
                    placeholder="Amount to deposit"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
                <button onClick={handleDepositRealFuddy}>Deposit Real $FUDDY</button>
            </div>
            <div>
                <h2>Transfer Real $FUDDY</h2>
                <input
                    type="text"
                    placeholder="Target Player ID"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount to transfer"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                />
                <button onClick={handleTransferFuddy}>Transfer</button>
            </div>
            <div>
                <h2>Deposit Crystals</h2>
                <select onChange={(e) => setCrystalType(e.target.value)}>
                    <option value="">Select Crystal Type</option>
                    <option value="Type1">Type 1</option>
                    <option value="Type2">Type 2</option>
                </select>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleDepositCrystalsAction}>Deposit</button>
            </div>
            <div>
                <h2>Convert to $FUDDY</h2>
                <button onClick={handleConvertToFUDDYAction}>Convert</button>
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
