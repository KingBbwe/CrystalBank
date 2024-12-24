import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Buffer "mo:base/Buffer";
import Error "mo:base/Error";

actor class FuddyManagement(gameAuthCanisterId : Principal) {
    // Type definitions
    public type PlayerID = Text;
    public type FuddyBalance = Nat;

    public type Transaction = {
        id : Text;
        fromPlayer : ?PlayerID;
        toPlayer : ?PlayerID;
        amount : Nat;
        transactionType : TransactionType;
        timestamp : Int;
        status : TransactionStatus;
        blockchainHash : ?Text;
    };

    public type TransactionType = {
        #Deposit;
        #Withdrawal;
        #Transfer;
        #BlockchainConversion;
    };

    public type TransactionStatus = {
        #Pending;
        #Completed;
        #Failed;
        #Reversed;
    };

    public type TransactionError = {
        #InsufficientFunds;
        #InvalidAmount;
        #RateLimited;
        #SystemPaused;
        #UserNotFound;
        #BlockchainError;
        #Unauthorized;
    };

    // Stable storage
    private stable var balanceEntries : [(PlayerID, FuddyBalance)] = [];
    private stable var transactionEntries : [(Text, Transaction)] = [];
    private stable var adminPrincipals : [Principal] = [];
    private stable var systemPaused : Bool = false;
    private stable var totalSupply : Nat = 0;
    private stable var centralReserve : Nat = 1_000_000;

    // Runtime storage
    private var balances = HashMap.HashMap<PlayerID, FuddyBalance>(10, Text.equal, Text.hash);
    private var transactions = HashMap.HashMap<Text, Transaction>(100, Text.equal, Text.hash);
    private var pendingTransactions = HashMap.HashMap<Text, Transaction>(10, Text.equal, Text.hash);

    // Constants
    private let MAX_TRANSACTION_AMOUNT : Nat = 1_000_000;
    private let MIN_RESERVE_RATIO : Nat = 10; // 10% of total supply
    private let TRANSACTION_COOLDOWN : Int = 60_000_000_000; // 1 minute
    private let BLOCKCHAIN_WALLET_PRINCIPAL = Principal.fromText("<oeogn-qaaaa-aaaam-acoyq-cai>");

    // System upgrade hooks
    system func preupgrade() {
        balanceEntries := Iter.toArray(balances.entries());
        transactionEntries := Iter.toArray(transactions.entries());
    };

    system func postupgrade() {
        balances := HashMap.fromIter<PlayerID, FuddyBalance>(balanceEntries.vals(), 10, Text.equal, Text.hash);
        transactions := HashMap.fromIter<Text, Transaction>(transactionEntries.vals(), 100, Text.equal, Text.hash);
        balanceEntries := [];
        transactionEntries := [];
    };

    // Helper functions
    private func _isAuthorized(caller : Principal) : Bool {
        Array.find<Principal>(adminPrincipals, func(p) { p == caller }) != null;
    };

    private func _validateAmount(amount : Nat) : Bool {
        amount > 0 and amount <= MAX_TRANSACTION_AMOUNT;
    };

    private func _checkReserveRequirements(amount : Nat) : Bool {
        let minReserve = totalSupply * MIN_RESERVE_RATIO / 100;
        centralReserve >= minReserve + amount;
    };

    // Transaction Management
    public shared({ caller }) func deposit(
        playerId : PlayerID,
        amount : Nat
    ) : async Result.Result<Transaction, TransactionError> {
        if (systemPaused) return #err(#SystemPaused);
        if (not _validateAmount(amount)) return #err(#InvalidAmount);
        if (not _checkReserveRequirements(amount)) return #err(#InsufficientFunds);

        let currentBalance = balances.get(playerId).unwrapOr(0);
        balances.put(playerId, currentBalance + amount);
        totalSupply += amount;

        let transaction = _createTransaction(null, ?playerId, amount, #Deposit);
        transactions.put(transaction.id, transaction);

        #ok(transaction)
    };

    public shared({ caller }) func withdraw(
        playerId : PlayerID,
        amount : Nat
    ) : async Result.Result<Transaction, TransactionError> {
        if (systemPaused) return #err(#SystemPaused);
        if (not _validateAmount(amount)) return #err(#InvalidAmount);

        let currentBalance = balances.get(playerId).unwrapOr(0);
        if (currentBalance < amount) return #err(#InsufficientFunds);

        balances.put(playerId, currentBalance - amount);
        totalSupply -= amount;

        let transaction = _createTransaction(?playerId, null, amount, #Withdrawal);
        transactions.put(transaction.id, transaction);

        #ok(transaction)
    };

    public shared({ caller }) func transfer(
        fromPlayer : PlayerID,
        toPlayer : PlayerID,
        amount : Nat
    ) : async Result.Result<Transaction, TransactionError> {
        if (systemPaused) return #err(#SystemPaused);
        if (not _validateAmount(amount)) return #err(#InvalidAmount);

        let fromBalance = balances.get(fromPlayer).unwrapOr(0);
        if (fromBalance < amount) return #err(#InsufficientFunds);

        let toBalance = balances.get(toPlayer).unwrapOr(0);
        
        balances.put(fromPlayer, fromBalance - amount);
        balances.put(toPlayer, toBalance + amount);

        let transaction = _createTransaction(?fromPlayer, ?toPlayer, amount, #Transfer);
        transactions.put(transaction.id, transaction);

        #ok(transaction)
    };

    public shared({ caller }) func convertToBlockchain(
        playerId : PlayerID,
        amount : Nat
    ) : async Result.Result<Transaction, TransactionError> {
        if
