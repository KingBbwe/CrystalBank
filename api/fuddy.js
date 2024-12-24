import { hybridWallet } from './hybridWallet'; // Assuming hybridWallet API is in the same directory

/**
 * Handle the deposit of crystals by a player.
 * This assumes the player has already been validated by Player ID.
 * @param {string} playerId - The ID of the player.
 * @param {string} crystalType - The type of crystal being deposited.
 * @param {number} amount - The amount of crystals being deposited.
 * @returns {Promise<string>} - A message indicating success or failure.
 */
export const handleDepositCrystals = async (playerId, crystalType, amount) => {
    try {
        // Make backend call to deposit crystals
        const result = await hybridWallet.depositCrystals(playerId, crystalType, amount);

        if (result.ok) {
            return 'Crystals deposited successfully';
        } else {
            return `Deposit failed: ${result.err}`;
        }
    } catch (error) {
        console.error('Error depositing crystals:', error);
        throw new Error('Error depositing crystals');
    }
};

/**
 * Handle the conversion of crystals to in-game FUDDY or $FUDDY.
 * Includes redundancy check to ensure enough real $FUDDY backing.
 * @param {string} playerId - The ID of the player.
 * @param {number} amount - The amount of crystals to convert.
 * @param {number} realFuddyBalance - Player's current real $FUDDY balance.
 * @returns {Promise<string>} - A message indicating success or failure.
 */
export const handleConvertToFUDDY = async (playerId, amount, realFuddyBalance) => {
    try {
        // Enforce redundancy mechanism
        if (amount > realFuddyBalance) {
            return 'Conversion limited by real $FUDDY balance. Please increase your real $FUDDY backing.';
        }

        // Make backend call to convert crystals to FUDDY
        const result = await hybridWallet.convertToInGameFuddy(playerId, amount);

        if (result.ok) {
            return `Conversion successful: ${result.ok} $FUDDY`;
        } else {
            return `Conversion failed: ${result.err}`;
        }
    } catch (error) {
        console.error('Error converting crystals to FUDDY:', error);
        throw new Error('Error converting crystals to FUDDY');
    }
};
