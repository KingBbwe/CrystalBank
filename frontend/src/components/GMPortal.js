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
    const [nftName, setNftName] = useState('');
    const [nftDescription, setNftDescription] = useState('');
    const [economicHealth, setEconomicHealth] = useState(null);
    const [allTransactions, setAllTransactions] = useState([]);
    const [playerNFTs, setPlayerNFTs] = useState([]);
    const [allNFTs, setAllNFTs] = useState([]);
    const [poolBalance, setPoolBalance] = useState(0);
    const [totalSupply, setTotalSupply] = useState(0);

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

    // Get Economic Health Indicators
    const handleGetEconomicHealth = async () => {
        try {
            const health = await gameCoordinator.getEconomicHealthIndicators();
            setEconomicHealth(health);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Get All Transactions
    const handleGetAllTransactions = async () => {
        try {
            const transactions = await gameCoordinator.getAllTransactions();
            setAllTransactions(transactions);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Create NFT
    const handleCreateNFT = async () => {
        try {
            const result = await gameCoordinator.createNFT(playerId, nftName, nftDescription);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Get Player NFTs
    const handleGetPlayerNFTs = async () => {
        try {
            const nfts = await gameCoordinator.getPlayerNFTs(playerId);
            setPlayerNFTs(nfts);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Get All NFTs
    const handleGetAllNFTs = async () => {
        try {
            const nfts = await gameCoordinator.getAllNFTs();
            setAllNFTs(nfts);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Acquire FUDDY from Pool
    const handleAcquireFuddyFromPool = async () => {
        try {
            const result = await gameCoordinator.acquireFUDDYFromPool(playerId, amount);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Get Pool Balance
    const handleGetPoolBalance = async () => {
        try {
            const balance = await gameCoordinator.getPoolBalance();
            setPoolBalance(balance);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Buy FUDDY from Market
    const handleBuyFuddy = async () => {
        try {
            const result = await gameCoordinator.buyFUDDY(playerId, amount);
            alert(result.ok || `Error: ${result.err}`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // Get Total Supply
    const handleGetTotalSupply = async () => {
        try {
            const supply = await gameCoordinator.getTotalSupply();
            setTotalSupply(supply);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <div>
            <h1>GM Portal</h1>

            {/* Economic Health */}
            <div>
                <h2>Economic Health</h2>
                <button onClick={handleGetEconomicHealth}>Get Economic Health</button>
                {economicHealth && (
                    <div>
                        <p>Total Real FUDDY: {economicHealth.totalRealFuddy}</p>
                        <p>Total In-Game FUDDY: {economicHealth.totalInGameFuddy}</p>
                        <p>System Reserve: {economicHealth.systemReserve}</p>
                        <p>Average Behavior Score: {economicHealth.averageBehaviorScore}</p>
                    </div>
                )}
            </div>

            {/* Player Management */}
            <div>
                <h2>Player Management</h2>
                <input
                    type="text"
                    placeholder="Player ID"
                    onChange={(e) => setPlayerId(e.target.value)}
                />
                <button onClick={handleRegisterPlayer}>Register Player</button>
            </div>

            {/* Transaction Oversight */}
            <div>
                <h2>Transaction Oversight</h2>
                <button onClick={handleGetAllTransactions}>Get All Transactions</button>
                {allTransactions.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Action</th>
                                <th>Amount</th>
                                <th>Player ID</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTransactions.map((tx, index) => (
                                <tr key={index}>
                                    <td>{tx.action}</td>
                                    <td>{tx.amount}</td>
                                    <td>{tx.playerId}</td>
                                    <td>{new Date(tx.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Resource Management */}
            <div>
                <h2>Resource Management</h2>
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
                <button onClick={handleDistributeCrystals}>Distribute Crystals</button>
            </div>

            {/* NFT Management */}
            <div>
                <h2>NFT Management</h2>
                <input
                    type="text"
                    placeholder="Player ID"
                    onChange={(e) => setPlayerId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="NFT Name"
                    onChange={(e) => setNftName(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="NFT Description"
                    onChange={(e) => setNftDescription(e.target.value)}
                />
                <button onClick={handleCreateNFT}>Create NFT</button>
                <button onClick={handleGetPlayerNFTs}>Get Player NFTs</button>
                <button onClick={handleGetAllNFTs}>Get All NFTs</button>
                {playerNFTs.length > 0 && (
                    <div>
                        <h3>Player NFTs</h3>
                        <ul>
                            {playerNFTs.map((nft, index) => (
                                <li key={index}>
                                    {nft.name} - {nft.description} (Owner: {nft.owner})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {allNFTs.length > 0 && (
                    <div>
                        <h3>All NFTs</h3>
                        <ul>
                            {allNFTs.map((nft, index) => (
                                <li key={index}>
                                    {nft.name} - {nft.description} (Owner: {nft.owner})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Fuddy Management */}
            <div>
                <h2>Fuddy Management</h2>
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
                <button onClick={handleTransferFuddy}>Transfer Fuddy</button>
                <button onClick={handleConvertFuddy}>Convert Fuddy</button>
            </div>

            {/* Liquidity Pool */}
            <div>
                <h2>Liquidity Pool</h2>
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
                <button onClick={handleAcquireFuddyFromPool}>Acquire Fuddy</button>
                <button onClick={handleGetPoolBalance}>Get Pool Balance</button>
                {poolBalance > 0 && <p>Pool Balance: {poolBalance}</p>}
            </div>

            {/* Market Interaction */}
            <div>
                <h2>Market Interaction</h2>
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
                <button onClick={handleBuyFuddy}>Buy Fuddy</button>
                <button onClick={handleGetTotalSupply}>Get Total Supply</button>
                {totalSupply > 0 && <p>Total Supply: {totalSupply}</p>}
            </div>
        </div>
    );
}

export default GMPortal;
