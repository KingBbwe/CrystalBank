import Array "mo:base/Array";
import Time "mo:base/Time";

actor TransactionHistory {
    type TransactionRecord = { action: Text; amount: Nat; timestamp: Int; playerId: Text };

    stable var records: [TransactionRecord] = [];

    public shared func logTransaction(playerId: Text, action: Text, amount: Nat): async () {
        records := Array.append(records, [{ action; amount; timestamp = Time.now(); playerId }]);
    };

    public shared func getTransactionHistory(): async [TransactionRecord] {
        return records;
    };

    public shared func getPlayerTransactions(playerId: Text): async [TransactionRecord] {
        return Array.filter(records, func(record) { record.playerId == playerId });
    };
};
