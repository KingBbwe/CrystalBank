import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";
import Iter "mo:base/Iter";
import Order "mo:base/Order";

actor class TransactionLogger() {
    type TransactionType = {
        #ItemPurchase;
        #ResourceExchange;
        #Reward;
        #Penalty;
        #GameEvent;
        #EconomicInteraction;
    };

    type TransactionRecord = {
        id: Nat;
        timestamp: Time.Time;
        sender: Principal;
        recipient: ?Principal;
        transactionType: TransactionType;
        resourceType: Text;
        amount: Nat;
        gameContext: ?Text;
        metadata: [(Text, Text)];
    };

    private stable var transactionsStable: [(Nat, TransactionRecord)] = [];
    private var transactionMap = HashMap.HashMap<Nat, TransactionRecord>(
        10,
        Nat.equal,
        Nat.hash
    );
    private stable var nextTransactionId: Nat = 1;

    public shared({ caller }) func logTransaction(
        transactionType: TransactionType,
        resourceType: Text,
        amount: Nat,
        recipient: ?Principal,
        gameContext: ?Text,
        additionalMetadata: [(Text, Text)]
    ): async Result.Result<Nat, Text> {
        let transactionId = nextTransactionId;
        nextTransactionId += 1;

        if (Text.size(resourceType) == 0) {
            return #err("Resource type cannot be empty");
        };

        let transaction: TransactionRecord = {
            id = transactionId;
            timestamp = Time.now();
            sender = caller;
            recipient;
            transactionType;
            resourceType;
            amount;
            gameContext;
            metadata = additionalMetadata;
        };

        transactionMap.put(transactionId, transaction);
        #ok(transactionId)
    };

    public query func getPlayerTransactions(
        player: Principal,
        limit: ?Nat
    ): async [TransactionRecord] {
        let playerTransactions = Buffer.Buffer<TransactionRecord>(0);

        for ((_, transaction) in transactionMap.entries()) {
            if (transaction.sender == player or ?player == transaction.recipient) {
                playerTransactions.add(transaction);
            };
        };

        let sortedTransactions = Buffer.toArray(playerTransactions);
        Array.sort(sortedTransactions, func(a, b): Order.Order {
            if (a.timestamp > b.timestamp) { #less }
            else if (a.timestamp < b.timestamp) { #greater }
            else { #equal }
        });

        switch (limit) {
            case (null) { sortedTransactions };
            case (?maxLimit) {
                Array.subArray(sortedTransactions, 0, Nat.min(maxLimit, sortedTransactions.size()))
            };
        }
    };

    public query func getTransactionStatistics(
        timeframe: ?Time.Time
    ): async {
        totalTransactions: Nat;
        totalResourcesExchanged: Nat;
        mostFrequentTransactionType: TransactionType;
    } {
        var totalTransactions = 0;
        
var totalResourcesExchanged = 0;

let transactionTypeCounts = HashMap.HashMap<TransactionType, Nat>(
          10,
          func(a, b) { a == b },
          func(a) {
              switch (a) {
                  case (#ItemPurchase) { 0 };
                  case (#ResourceExchange) { 1 };
                  case (#Reward) { 2 };
                  case (#Penalty) { 3 };
                  case (#GameEvent) { 4 };
                  case (#EconomicInteraction) { 5 };
              }
          }
      );

      for ((_, transaction) in transactionMap.entries()) {
          let isWithinTimeframe = switch (timeframe) {
              case (null) { true };
              case (?cutoffTime) { transaction.timestamp >= cutoffTime };
          };

          if (isWithinTimeframe) {
              totalTransactions += 1;
              totalResourcesExchanged += transaction.amount;

              let currentCount = switch (transactionTypeCounts.get(transaction.transactionType)) {
                  case (null) { 0 };
                  case (?count) { count };
              };
              transactionTypeCounts.put(transaction.transactionType, currentCount + 1);
          };
      };

      var mostFrequentType: TransactionType = #ItemPurchase;

      var highestCount = 0;

      for ((transactionType, count) in transactionTypeCounts.entries()) {
          if (count > highestCount) {
              highestCount := count;

              mostFrequentType := transactionType;

          };
      };

      {

          totalTransactions;

          totalResourcesExchanged;

          mostFrequentTransactionType = mostFrequentType;

      }
  };

   system func preupgrade() {

       transactionsStable := Iter.toArray(transactionMap.entries());

   };

   system func postupgrade() {

       transactionMap := HashMap.fromIter<Nat, TransactionRecord>(
           transactionsStable.vals(),
           10,
           Nat.equal,
           Nat.hash
       );

   };

}
