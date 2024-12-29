import React, { useState, useEffect } from 'react';
import GameCoordinator from '../api/GameCoordinator'; // Import the GameCoordinator API

function PlayerDashboard() {
    const [playerId, setPlayerId] = useState('');
    const [crystalType, setCrystalType] = useState('');
    const [amount, setAmount] = useState(0);
    const [transferTarget, setTransferTarget] = useState('');
    const [transferAmount, setTransferAmount] = useState(0);
    const [fuddyBalance, setFuddyBalance] = useState(0);

    // Fetch FUDDY balance when playerId changes
    useEffect(() => {
        if (playerId) {
            const fetchFuddyBalance = async () => {
                try {
                    const balance = await GameCoordinator.getFuddyBalance(playerId);
                    setFuddyBalance(balance);
                } catch (error) {
                    console.error('Error fetching FUDDY balance:', error);
                }
            };
            fetchFuddyBalance();
        }
    }, [playerId]);

    // Handle crystal deposits
    const handleDepositCrystals = async () => {
        try {
            const result = await GameCoordinator.depositCrystals(playerId, crystalType, amount);
            alert(result);
        } catch (error) {
            alert('Error depositing crystals: ' + error.message);
        }
    };

    // Handle crystal transfers
    const handleTransferCrystals = async () => {
        try {
            const result = await GameCoordinator.transferCrystals(playerId, transferTarget, crystalType, transferAmount);
            alert(result);
        } catch (error) {
            alert('Error transferring crystals: ' + error.message);
        }
    };

    // Handle FUDDY deposits
    const handleDepositFuddy = async () => {
        try {
            const result = await GameCoordinator.depositFuddy(playerId, amount);
            alert(result);
        } catch (error) {
            alert('Error depositing FUDDY: ' + error.message);
        }
    };

    // Handle FUDDY withdrawals
    const handleWithdrawFuddy = async () => {
        try {
            const result = await GameCoordinator.withdrawFuddy(playerId, amount);
            alert(result);
        } catch (error) {
            alert('Error withdrawing FUDDY: ' + error.message);
        }
    };

    // Handle FUDDY transfers
    const handleTransferFuddy = async () => {
        try {
            const result = await GameCoordinator.transferFuddy(playerId, transferTarget, transferAmount);
            alert(result);
        } catch (error) {
            alert('Error transferring FUDDY: ' + error.message);
        }
    };

    // Handle FUDDY to blockchain conversion
    const handleConvertFuddyToBlockchain = async () => {
        try {
            const result = await GameCoordinator.convertFuddyToBlockchain(playerId, amount);
            alert(result);
        } catch (error) {
            alert('Error converting FUDDY to blockchain: ' + error.message);
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
                <h2>FUDDY Balance: {fuddyBalance}</h2>
            </div>
            <div>
                <h2>Deposit Crystals</h2>
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
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleDepositCrystals}>Deposit</button>
            </div>
            <div>
                <h2>Transfer Crystals</h2>
                <input
                    type="text"
                    placeholder="Target Player ID"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
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
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                />
                <button onClick={handleTransferCrystals}>Transfer</button>
            </div>
            <div>
                <h2>Deposit FUDDY</h2>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleDepositFuddy}>Deposit</button>
            </div>
            <div>
                <h2>Withdraw FUDDY</h2>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleWithdrawFuddy}>Withdraw</button>
            </div>
            <div>
                <h2>Transfer FUDDY</h2>
                <input
                    type="text"
                    placeholder="Target Player ID"
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(Number(e.target.value))}
                />
                <button onClick={handleTransferFuddy}>Transfer</button>
            </div>
            <div>
                <h2>Convert FUDDY to Blockchain</h2>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button onClick={handleConvertFuddyToBlockchain}>Convert</button>
            </div>
        </div>
    );
}

export default PlayerDashboard;
