import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Configuration
const CONFIG = {
    CANISTER_ID: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    HOST: "https://ic0.app"
};

export default function CrystalBankDashboard() {
    const [playerId, setPlayerId] = useState('');
    const [accountProfile, setAccountProfile] = useState(null);
    const [crystalType, setCrystalType] = useState('');
    const [amount, setAmount] = useState(0);
    const [transferTarget, setTransferTarget] = useState('');
    const [transferAmount, setTransferAmount] = useState(0);
    const [economicHealth, setEconomicHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [actor, setActor] = useState(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                const authClient = await AuthClient.create();
                const agent = new HttpAgent({
                    host: CONFIG.HOST,
                    identity: authClient.getIdentity()
                });

                if (process.env.NODE_ENV !== "production") {
                    await agent.fetchRootKey();
                }

                const actor = Actor.createActor(crystalBankIdl, {
                    agent,
                    canisterId: CONFIG.CANISTER_ID
                });

                setActor(actor);
                // Fetch economic health indicators periodically
                fetchEconomicHealth(actor);
                const intervalId = setInterval(() => fetchEconomicHealth(actor), 60000);
                return () => clearInterval(intervalId);
            } catch (error) {
                setError('Failed to initialize client: ' + error.message);
            }
        };
        initialize();
    }, []);

    useEffect(() => {
        if (playerId && actor) {
            fetchAccountProfile();
        }
    }, [playerId, actor]);

    const fetchAccountProfile = async () => {
        if (!actor) return;
        try {
            setLoading(true);
            const profile = await actor.getAccountProfile(playerId);
            setAccountProfile(profile);
            setError('');
        } catch (error) {
            setError('Failed to fetch profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchEconomicHealth = async (currentActor) => {
        if (!currentActor) return;
        try {
            const health = await currentActor.getEconomicHealthIndicators();
            setEconomicHealth(health);
        } catch (error) {
            console.error('Failed to fetch economic health:', error);
        }
    };

    const handleDeposit = async () => {
        if (!actor) return;
        try {
            setLoading(true);
            await actor.depositCrystals(playerId, crystalType, amount);
            await fetchAccountProfile();
            setError('');
        } catch (error) {
            setError('Deposit failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTransfer = async () => {
        if (!actor) return;
        try {
            setLoading(true);
            await actor.transferRealFuddy(playerId, transferTarget, transferAmount);
            await fetchAccountProfile();
            setError('');
        } catch (error) {
            setError('Transfer failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async () => {
        if (!actor) return;
        try {
            setLoading(true);
            await actor.convertToRealFuddy(playerId, amount);
            await fetchAccountProfile();
            setError('');
        } catch (error) {
            setError('Conversion failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Crystal Bank Dashboard</h1>
            
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <div className="mb-6">
                <label className="block mb-2">
                    Player ID:
                    <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={playerId}
                        onChange={(e) => setPlayerId(e.target.value)}
                    />
                </label>
            </div>

            {accountProfile && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Account Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>Real FUDDY: {accountProfile.realFuddyBalance}</div>
                            <div>In-Game FUDDY: {accountProfile.inGameFuddyBalance}</div>
                            <div>Crystal Balance: {accountProfile.crystalBalance}</div>
                            <div>Behavior Score: {accountProfile.behaviorScore}</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {economicHealth && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Economic Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>Total Real FUDDY: {economicHealth.totalRealFuddy}</div>
                            <div>Total In-Game FUDDY: {economicHealth.totalInGameFuddy}</div>
                            <div>System Reserve: {economicHealth.systemReserve}</div>
                            <div>Average Behavior Score: {economicHealth.averageBehaviorScore}</div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Deposit Crystals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <select 
                            className="w-full p-2 border rounded mb-2"
                            value={crystalType}
                            onChange={(e) => setCrystalType(e.target.value)}
                        >
                            <option value="">Select Crystal Type</option>
                            <option value="Type1">Type 1</option>
                            <option value="Type2">Type 2</option>
                        </select>
                        <input
                            type="number"
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                        <button 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            onClick={handleDeposit}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Deposit'}
                        </button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Transfer Real FUDDY</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="text"
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Target Player ID"
                            value={transferTarget}
                            onChange={(e) => setTransferTarget(e.target.value)}
                        />
                        <input
                            type="number"
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Amount"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(Number(e.target.value))}
                        />
                        <button 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            onClick={handleTransfer}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Transfer'}
                        </button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Convert to Real FUDDY</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="number"
                            className="w-full p-2 border rounded mb-2"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                        <button 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                            onClick={handleConvert}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Convert'}
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
