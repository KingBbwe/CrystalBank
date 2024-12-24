import Result "mo:base/Result";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Buffer "mo:base/Buffer";

actor GameEconomicInteractions {
    // Resource Types
    type ResourceType = {
        #Crystal;
        #InGameFuddy;
        #SpecialItem;
        #QuestToken;
    };

    // Quest and Achievement Structures
    type QuestDifficulty = {
        #Easy;
        #Medium;
        #Hard;
        #Legendary;
    };

    type Quest = {
        id : Nat;
        name : Text;
        description : Text;
        difficulty : QuestDifficulty;
        requiredActions : [Text];
        rewards : [QuestReward];
    };

    type QuestReward = {
        resourceType : ResourceType;
        amount : Nat;
    };

    type PlayerQuestProgress = {
        questId : Nat;
        completedActions : [Text];
        completionTimestamp : ?Time.Time;
        claimedReward : Bool;
    };

    // Player Resource Management
    type PlayerResources = {
        crystals : Nat;
        inGameFuddy : Nat;
        specialItems : Nat;
        questTokens : Nat;
    };

    // Private Variables
    private stable var activeQuests = HashMap.HashMap<Nat, Quest>(
        10, 
        Nat.equal, 
        Nat.hash
    );

    private stable var playerQuestProgress = HashMap.HashMap<Principal, [PlayerQuestProgress]>(
        10, 
        Principal.equal, 
        Principal.hash
    );

    private stable var playerResources = HashMap.HashMap<Principal, PlayerResources>(
        10, 
        Principal.equal, 
        Principal.hash
    );

    private stable var questIdCounter : Nat = 0;

    // Utility Functions
    private func _generateUniqueQuestId() : Nat {
        questIdCounter += 1;
        questIdCounter
    }

    private func _findQuestProgress(
        progress : [PlayerQuestProgress], 
        questId : Nat
    ) : ?PlayerQuestProgress {
        Array.find(progress, func(p : PlayerQuestProgress) : Bool { 
            p.questId == questId 
        })
    }

    // Existing generateDynamicQuest method remains the same as in the previous code

    // Complete Quest Progress Update Method
    public shared(msg) func updateQuestProgress(
        questId : Nat,
        completedAction : Text
    ) : async Result.Result<PlayerQuestProgress, Text> {
        let caller = msg.caller;

        // Retrieve quest details
        let quest = switch (activeQuests.get(questId)) {
            case (null) { return #err("Quest not found") };
            case (?foundQuest) { foundQuest };
        };

        // Retrieve or initialize quest progress
        let currentProgress = switch (playerQuestProgress.get(caller)) {
            case (null) { [] };
            case (?progress) { progress };
        };

        // Find or create quest progress
        let updatedProgress = switch (_findQuestProgress(currentProgress, questId)) {
            case (null) {
                let newProgress : PlayerQuestProgress = {
                    questId = questId;
                    completedActions = [completedAction];
                    completionTimestamp = null;
                    claimedReward = false;
                };
                newProgress
            };
            case (?existingProgress) {
                // Check if action already completed
                if (Array.find(existingProgress.completedActions, 
                    func(action : Text) : Bool { action == completedAction }) != null) {
                    return #err("Action already completed")
                };

                let updatedPlayerProgress : PlayerQuestProgress = {
                    questId = existingProgress.questId;
                    completedActions = Array.append(existingProgress.completedActions, [completedAction]);
                    completionTimestamp = existingProgress.completionTimestamp;
                    claimedReward = existingProgress.claimedReward;
                };
                updatedPlayerProgress
            };
        };

        // Check if all quest actions are completed
        let isQuestComplete = quest.requiredActions.size() == updatedProgress.completedActions.size();
        
        let finalProgress = if (isQuestComplete) {
            { 
                updatedProgress with 
                completionTimestamp = ?Time.now() 
            }
        } else {
            updatedProgress
        };

        // Update player quest progress
        let updatedPlayerProgresses = switch (_findQuestProgress(currentProgress, questId)) {
            case (null) { Array.append(currentProgress, [finalProgress]) };
            case (?_) { 
                Array.map(currentProgress, func(p : PlayerQuestProgress) : PlayerQuestProgress {
                    if (p.questId == questId) finalProgress else p
                })
            };
        };

        playerQuestProgress.put(caller, updatedPlayerProgresses);
        #ok(finalProgress)
    }

    // Claim Quest Rewards
    public shared(msg) func claimQuestRewards(questId : Nat) : async Result.Result<[QuestReward], Text> {
        let caller = msg.caller;

        // Retrieve player's quest progress
        let playerProgress = switch (playerQuestProgress.get(caller)) {
            case (null) { return #err("No quest progress found") };
            case (?progress) { progress };
        };

        // Find specific quest progress
        let questProgress = switch (_findQuestProgress(playerProgress, questId)) {
            case (null) { return #err("Quest progress not found") };
            case (?progress) { progress };
        };

        // Check if quest is complete and reward not claimed
        if (questProgress.completionTimestamp == null) {
            return #err("Quest not completed")
        };

        if (questProgress.claimedReward) {
            return #err("Rewards already claimed")
        };

        // Retrieve quest details
        let quest = switch (activeQuests.get(questId)) {
            case (null) { return #err("Quest not found") };
            case (?foundQuest) { foundQuest };
        };

        // Update player resources
        let currentResources = switch (playerResources.get(caller)) {
            case (null) { 
                {
                    crystals = 0;
                    inGameFuddy = 0;
                    specialItems = 0;
                    questTokens = 0;
                }
            };
            case (?resources) { resources };
        };

        // Update resources based on quest rewards
        let updatedResources = quest.rewards.fold(currentResources, func(
            acc : PlayerResources, 
            reward : QuestReward
        ) : PlayerResources {
            switch (reward.resourceType) {
                case (#Crystal) { 
                    { acc with crystals = acc.crystals + reward.amount }
                };
                case (#InGameFuddy) { 
                    { acc with inGameFuddy = acc.inGameFuddy + reward.amount }
                };
                case (#SpecialItem) { 
                    { acc with specialItems = acc.specialItems + reward.amount }
                };
                case (#QuestToken) { 
                    { acc with questTokens = acc.questTokens + reward.amount }
                };
            }
        });

        // Mark rewards as claimed and update player progress
        let updatedPlayerProgresses = Array.map(playerProgress, func(
            p : PlayerQuestProgress
        ) : PlayerQuestProgress {
            if (p.questId == questId) {
                { 
                    p with 
                    claimedReward = true 
                }
            } else p
        });

        playerResources.put(caller, updatedResources);
        playerQuestProgress.put(caller, updatedPlayerProgresses);

        #ok(quest.rewards)
    }

    // Get Player Resources
    public query func getPlayerResources(player : Principal) : async ?PlayerResources {
        playerResources.get(player)
    }

    // Get Active Quests
    public query func getActiveQuests() : async [(Nat, Quest)] {
        Iter.toArray(activeQuests.entries())
    }

    // Get Player Quest Progress
    public query func getPlayerQuestProgress(player : Principal) : async [PlayerQuestProgress] {
        switch (playerQuestProgress.get(player)) {
            case (null) { [] };
            case (?progress) { progress };
        }
    }
}
