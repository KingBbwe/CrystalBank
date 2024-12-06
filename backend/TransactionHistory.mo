actor TransactionHistory {
    type TransactionRecord = { action: Text; amount: Nat; timestamp: Int; playerId: Text };
    stable var records: [TransactionRecord] = [];

    public func logTransaction(playerId: Text, action: Text, amount: Nat): async () {
        records := records # [{ action; amount; timestamp = Time.now(); playerId }];
    };

    public func getTransactionHistory(): async [TransactionRecord] {
        return records;
    };

    public func getPlayerTransactions(playerId: Text): async [TransactionRecord] {
        return Array.filter(records, func(record) { record.playerId == playerId });
    };
};

