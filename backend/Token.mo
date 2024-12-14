actor interface Token {
    public func balanceOf(account: Text): async Nat;
    public func transfer(to: Text, amount: Nat): async Result<Text, Text>;
}
