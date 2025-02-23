Here's the complete script.js file extracted from the HTML content:

```javascript
// Global Variables & Mock Data
var currentUser = null;
var paymentRequests = [];
var mockData = {
  balances: {
    realFuddy: 1000,
    gameFuddy: 500,
    crystals: 200,
    nfts: 3
  },
  transactions: [
    { type: "Deposit", amount: 100, time: new Date().toLocaleString() },
    { type: "Convert", amount: 50, time: new Date().toLocaleString() }
  ],
  economic: {
    totalRealFuddy: 5000000,
    totalInGameFuddy: 8000000,
    systemReserve: 100000,
    avgBehaviorScore: 75
  },
  globalStats: {
    totalTransactions: 1200,
    totalResourcesExchanged: 750000,
    mostFrequentType: "Deposit"
  },
  crystalPool: {
    Type1: 10000,
    Type2: 5000,
    Type3: 2500,
    Type4: 1000
  }
};

// Payment Request Functions
function togglePrCrystalTypeCommon() {
  var type = document.getElementById("prPaymentTypeCommon").value;
  document.getElementById("prCrystalTypeDivCommon").style.display = (type === "Crystals") ? "block" : "none";
  if (currentUser === "admin") {
    document.getElementById("prForDivCommon").style.display = "block";
  } else {
    document.getElementById("prForDivCommon").style.display = "none";
  }
}

function sendPaymentRequestCommon() {
  var seller = (currentUser === "admin")
    ? document.getElementById("adminSellerIdCommon").value
    : document.getElementById("playerId").value;
  var buyer = document.getElementById("prBuyerIdCommon").value;
  var paymentType = document.getElementById("prPaymentTypeCommon").value;
  var crystalType = null, crystalName = null;
  if (paymentType === "Crystals") {
    crystalType = document.getElementById("prCrystalTypeCommon").value;
    crystalName = document.getElementById("prCrystalNameCommon").value;
  }
  var amount = Number(document.getElementById("prAmountCommon").value);
  var requestFor = (currentUser === "admin") ? document.getElementById("prForCommon").value : "";
  if (!seller || !buyer || !amount || (paymentType === "Crystals" && (!crystalType || !crystalName))) {
    showAlert("Please fill all fields for the payment request.");
    return;
  }
  var req = {
    seller: seller,
    buyer: buyer,
    paymentType: paymentType,
    crystalType: crystalType,
    crystalName: crystalName,
    amount: amount,
    requestFor: requestFor,
    status: "pending"
  };
  paymentRequests.push(req);
  showAlert("Payment request sent.");
  updateIncomingRequestsCommon();
}

function updateIncomingRequestsCommon() {
  var buyerId = document.getElementById("playerId").value;
  var incoming = paymentRequests.filter(function(r) {
    return r.buyer === buyerId && r.status === "pending";
  });
  var container = document.getElementById("incomingRequestsCommon");
  container.innerHTML = incoming.map(function(r, i) {
    return '<div style="border: 1px solid var(--neon-blue); padding: 5px; margin: 5px 0;">' +
             '<p>From: ' + r.seller + ' | ' + r.paymentType + ' ' +
             (r.paymentType==="Crystals" ? '(' + r.crystalType + ', ' + r.crystalName + ')' : '') +
             ' | Amount: ' + r.amount + (r.requestFor ? ' | For: ' + r.requestFor : '') + '</p>' +
             '<button onclick="approveRequestCommon(' + i + ')">Approve</button>' +
             '<button onclick="rejectRequestCommon(' + i + ')">Reject</button>' +
           '</div>';
  }).join("");
}

function approveRequestCommon(index) {
  var req = paymentRequests[index];
  if (req.paymentType === "FUDDY") {
    if (mockData.balances.realFuddy < req.amount) {
      showAlert("Buyer does not have enough $FUDDY.");
      return;
    }
    mockData.balances.realFuddy -= req.amount;
    showAlert("Approved: Transferred " + req.amount + " $FUDDY from buyer to seller.");
  } else if (req.paymentType === "Crystals") {
    showAlert("Approved: Transferred " + req.amount + " crystals (" + req.crystalType + ", " + req.crystalName + ") from buyer to seller.");
  }
  req.status = "approved";
  updateIncomingRequestsCommon();
  loadData();
}

function rejectRequestCommon(index) {
  paymentRequests[index].status = "rejected";
  showAlert("Payment request rejected.");
  updateIncomingRequestsCommon();
}

// Navigation & Header Functions
function login(role) {
  currentUser = role;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("header").style.display = "flex";
  if (role === "player") {
    document.getElementById("playerApp").style.display = "block";
    document.getElementById("adminInterface").style.display = "none";
    loadData();
    document.getElementById("playerSellerDiv").style.display = "block";
    document.getElementById("adminSellerDiv").style.display = "none";
    document.getElementById("sellerIdDisplay").textContent = document.getElementById("playerId").value;
  } else if (role === "admin") {
    document.getElementById("adminInterface").style.display = "block";
    document.getElementById("playerApp").style.display = "none";
    document.getElementById("adminSellerDiv").style.display = "block";
    document.getElementById("playerSellerDiv").style.display = "none";
  }
}

function logout() {
  currentUser = null;
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("header").style.display = "none";
  document.getElementById("playerApp").style.display = "none";
  document.getElementById("adminInterface").style.display = "none";
  document.getElementById("commonContent").style.display = "none";
}

function showCommonTab(tabId) {
  document.getElementById("playerApp").style.display = "none";
  document.getElementById("adminInterface").style.display = "none";
  document.getElementById("commonContent").style.display = "block";
  var tabs = document.querySelectorAll("#commonContent .tab-content");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  var el = document.getElementById(tabId);
  if (el) el.classList.add("active");
  if (tabId === "paymentRequest") {
    updateIncomingRequestsCommon();
    if (currentUser === "player") {
      document.getElementById("playerSellerDiv").style.display = "block";
      document.getElementById("adminSellerDiv").style.display = "none";
      document.getElementById("sellerIdDisplay").textContent = document.getElementById("playerId").value;
    } else if (currentUser === "admin") {
      document.getElementById("adminSellerDiv").style.display = "block";
      document.getElementById("playerSellerDiv").style.display = "none";
    }
  }
}

function backToInterface() {
  document.getElementById("commonContent").style.display = "none";
  if (currentUser === "player") {
    document.getElementById("playerApp").style.display = "block";
  } else if (currentUser === "admin") {
    document.getElementById("adminInterface").style.display = "block";
  }
}

function showTab(tabId) {
  document.getElementById("commonContent").style.display = "none";
  if (currentUser === "player") {
    document.getElementById("playerApp").style.display = "block";
  } else if (currentUser === "admin") {
    document.getElementById("adminInterface").style.display = "block";
  }
  var tabs = document.querySelectorAll(".tab-content");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].classList.remove("active");
  }
  var el = document.getElementById(tabId);
  if (el) el.classList.add("active");
  if (tabId === "paymentRequest") {
    updateIncomingRequestsCommon();
  }
}

function showAlert(message) {
  var alertBox = document.getElementById("alert");
  alertBox.textContent = message;
  alertBox.style.display = "block";
  setTimeout(function() { alertBox.style.display = "none"; }, 3000);
}

// Data & Action Functions
function loadData() {
  document.getElementById("realFuddyBalance").textContent = mockData.balances.realFuddy;
  document.getElementById("inGameFuddyBalance").textContent = mockData.balances.gameFuddy;
  document.getElementById("crystals").textContent = mockData.balances.crystals;
  document.getElementById("nfts").textContent = mockData.balances.nfts;
  document.getElementById("profilePlayerId").textContent = document.getElementById("playerId").value || "N/A";
  updateTransactionLog();
  updateCrystalPoolDisplay();
  updateIncomingRequestsCommon();
}

function updateTransactionLog() {
  var list = document.getElementById("transactionList");
  list.innerHTML = mockData.transactions.map(function(tx) {
    return "<li>" + tx.type + " - " + tx.amount + " at " + tx.time + "</li>";
  }).join("");
}

function updateCrystalPoolDisplay() {
  if(document.getElementById("poolType1"))
    document.getElementById("poolType1").textContent = mockData.crystalPool.Type1;
  if(document.getElementById("poolType2"))
    document.getElementById("poolType2").textContent = mockData.crystalPool.Type2;
  if(document.getElementById("poolType3"))
    document.getElementById("poolType3").textContent = mockData.crystalPool.Type3;
  if(document.getElementById("poolType4"))
    document.getElementById("poolType4").textContent = mockData.crystalPool.Type4;
}

async function depositRealFuddy() {
  showAlert("Deposit successful! (Mock Function)");
  var amt = Number(document.getElementById("depositAmount").value);
  mockData.balances.realFuddy += amt;
  loadData();
}

async function transferRealFuddy() {
  showAlert("Transfer successful! (Mock Function)");
  loadData();
}

async function convertInGameFuddy() {
  showAlert("Conversion successful! (Mock Function)");
  loadData();
}

async function depositCrystals() {
  showAlert("Crystal deposit successful! (Mock Function)");
  var amt = Number(document.getElementById("depositCrystalAmount").value);
  var type = document.getElementById("depositCrystalType").value;
  if (mockData.crystalPool[type] >= amt) {
    mockData.crystalPool[type] -= amt;
  } else {
    showAlert("Not enough crystals in pool to deposit!");
  }
  loadData();
}

async function transferCrystals() {
  showAlert("Crystal transfer successful! (Mock Function)");
  loadData();
}

async function withdrawFuddy() {
  var amt = Number(document.getElementById("withdrawAmount").value);
  var dest = document.getElementById("withdrawAddress").value;
  if (amt <= 0 || !dest) {
    showAlert("Enter a valid amount and destination address.");
    return;
  }
  showAlert("Withdrawal successful! (Mock Function)");
}

async function createNFT() {
  var nftName = document.getElementById("nftName").value;
  var nftDesc = document.getElementById("nftDesc").value;
  if (!nftName || !nftDesc) {
    showAlert("Please enter NFT name and description.");
    return;
  }
  mockData.balances.nfts++;
  showAlert("NFT created successfully! (Mock Function)");
  loadData();
}

async function fetchTransactionHistory() {
  showAlert("Transaction history fetched! (Mock Function)");
  updateTransactionLog();
}

async function registerPlayer() {
  showAlert("Player registered successfully! (Mock Function)");
}

async function handleDistributeCrystals() {
  var type = document.getElementById("adminDistCrystalType").value;
  var amt = Number(document.getElementById("adminDistributeAmount").value);
  if (!type || amt <= 0) {
    showAlert("Select a crystal type and valid amount.");
    return;
  }
  showAlert("Crystals distributed successfully! (Mock Function)");
}

async function handleAdminTransferFuddy() {
  showAlert("Admin transfer successful! (Mock Function)");
}

async function handleAdminConvertFuddy() {
  showAlert("Admin conversion successful! (Mock Function)");
}

async function handleAdjustBehavior() {
  var target = document.getElementById("gmBehaviorPlayerId").value;
  var amt = document.getElementById("gmAdjustmentAmount").value;
  if (!target || !amt) {
    showAlert("Fill all fields for behavior adjustment");
    return;
  }
  showAlert("Player behavior adjusted successfully! (Mock)");
}

async function handleUpdateRate() {
  var type = document.getElementById("gmRateCrystalType").value;
  var rate = document.getElementById("gmNewRate").value;
  if (!type || !rate) {
    showAlert("Fill all fields for updating conversion rate");
    return;
  }
  showAlert("Conversion rate updated successfully! (Mock)");
}

async function handleViewEconomicHealth() {
  showAlert("Economic health indicators refreshed! (Mock)");
  mockData.economic.totalRealFuddy = 5000000;
  mockData.economic.totalInGameFuddy = 8000000;
  mockData.economic.systemReserve = 100000;
  mockData.economic.avgBehaviorScore = 75;
  loadData();
}

async function handleSystemControl() {
  showAlert("System pause/resume toggled! (Mock)");
}

async function handleViewGlobalStats() {
  showAlert("Global transaction stats refreshed! (Mock)");
  mockData.globalStats.totalTransactions = 1200;
  mockData.globalStats.totalResourcesExchanged = 750000;
  mockData.globalStats.mostFrequentType = "Deposit";
  loadData();
}

async function handleWithdrawFuddy() {
  var amt = Number(document.getElementById("withdrawAmount").value);
  var dest = document.getElementById("withdrawAddress").value;
  if (amt <= 0 || !dest) {
    showAlert("Enter a valid amount and destination address");
    return;
  }
  showAlert("Withdrawal successful! (Mock Function)");
}

async function handleAdminWithdrawFuddy() {
  var amt = Number(document.getElementById("gmAdminWithdrawAmount").value);
  var dest = document.getElementById("gmAdminWithdrawAddress").value;
  if (amt <= 0 || !dest) {
    showAlert("Enter a valid amount and destination address");
    return;
  }
  showAlert("Admin withdrawal successful! (Mock Function)");
}

async function handleGenerateCrystals() {
  var add1 = Math.floor(Math.random() * 1000) + 100;
  var add2 = Math.floor(Math.random() * 500) + 50;
  var add3 = Math.floor(Math.random() * 250) + 25;
  var add4 = Math.floor(Math.random() * 100) + 10;
  var maxPool = { Type1: 10000, Type2: 5000, Type3: 2500, Type4: 1000 };
  if (mockData.crystalPool.Type1 + add1 > maxPool.Type1 ||
      mockData.crystalPool.Type2 + add2 > maxPool.Type2 ||
      mockData.crystalPool.Type3 + add3 > maxPool.Type3 ||
      mockData.crystalPool.Type4 + add4 > maxPool.Type4) {
    showAlert("Cannot add crystals: Pool exceeds maximum limits.");
    return;
  }
  mockData.crystalPool.Type1 += add1;
  mockData.crystalPool.Type2 += add2;
  mockData.crystalPool.Type3 += add3;
  mockData.crystalPool.Type4 += add4;
  showAlert("Crystals generated successfully!");
  updateCrystalPoolDisplay();
}

async function handleBuyFuddy() {
  var amt = Number(document.getElementById("buyAmount").value);
  if (amt <= 0) {
    showAlert("Enter a valid buy amount.");
    return;
  }
  mockData.balances.realFuddy += amt;
  showAlert("Buy successful! (Mock Function)");
  loadData();
}

// Utility Functions
function updateSellerDisplay() {
  var sellerId = document.getElementById("playerId").value;
  if (document.getElementById("sellerIdDisplay"))
    document.getElementById("sellerIdDisplay").textContent = sellerId;
}
```

This file contains all the JavaScript functionality from the original HTML file, including:
- Mock data structures
- Payment request handling
- User authentication flows
- Transaction processing
- UI navigation and display functions
- Economic system management
- Crystal generation/distribution logic

The code maintains all the original functionality with mock implementations for banking operations. To use this, save it as `script.js` and link it to your HTML file with a script tag.
