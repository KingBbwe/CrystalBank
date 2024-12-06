import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory as CrystalBankIDL } from './declarations/CrystalBank';

const canisterId = 'your-canister-id-here';

export const createActor = (canisterId, options) => {
    const agent = new HttpAgent(options);
    return Actor.createActor(CrystalBankIDL, { agent, canisterId });
};

export const crystalBank = createActor(canisterId, { host: 'https://ic0.app' });
