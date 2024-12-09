// DOM Elements
const connectWalletMsg = document.querySelector("#connectWalletMessage");
const connectWalletBtn = document.querySelector("#connectWallet");
const appContent = document.querySelector("#appContent");
const sidebar = document.getElementById("sidebar");
const menuIcon = document.getElementById("menuIcon");
const darkOverlay = document.getElementById("darkOverlay");

// Sections
const sections = {
  addCounterparty: document.getElementById("addCounterparty"),
  updateExposure: document.getElementById("updateExposure"),
  calculateRisk: document.getElementById("calculateRisk"),
  updateCollateral: document.getElementById("updateCollateral"),
  calculateCoverage: document.getElementById("calculateCoverageRatio"),
  showInfo: document.getElementById("showInfo"),
  performTransaction: document.getElementById("performTransaction"),
};

// Buttons
const buttons = {
  addCounterpartyBtn: document.querySelector("#addCounterpartyBtn"),
  updateExposureBtn: document.querySelector("#updateExposureBtn"),
  calculateRiskBtn: document.querySelector("#calculateRiskBtn"),
  updateCollateralBtn: document.querySelector("#updateCollateralBtn"),
  calculateCoverageBtn: document.querySelector("#calculateCoverageBtn"),
  showInfoBtn: document.querySelector("#showInfoBtn"),
  performTransactionBtn: document.querySelector("#performTransactionBtn"),
};

// Sidebar Links
const sidebarLinks = {
  addCounterpartyLink: document.getElementById("addCounterpartyLink"),
  updateExposureLink: document.getElementById("updateExposureLink"),
  calculateRiskLink: document.getElementById("calculateRiskLink"),
  updateCollateralLink: document.getElementById("updateCollateralLink"),
  calculateCoverageLink: document.getElementById("calculateCoverageLink"),
  showInfoLink: document.getElementById("showInfoLink"),
  performTransactionLink: document.getElementById("performTransactionLink"),
};

let provider, signer, contract;

const contractAddress = "0x620f8eCB21247b092976DfD36F01f34CAf962f27";
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "contrepartie",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "typeAlerte",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "valeur",
        "type": "uint256"
      }
    ],
    "name": "AlerteRisque",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "contrepartie",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nouveauCollateral",
        "type": "uint256"
      }
    ],
    "name": "CollateralMiseAJour",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "contrepartie",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "limiteExposition",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "scoreCredit",
        "type": "uint256"
      }
    ],
    "name": "ContrepartieAjoutee",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "initiateur",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "contrepartie",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "nouvelleExposition",
        "type": "int256"
      }
    ],
    "name": "ExpositionMiseAJour",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "contrepartie",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "expositionActuelle",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "limiteExposition",
        "type": "uint256"
      }
    ],
    "name": "LimiteDepassee",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "int256",
        "name": "montant",
        "type": "int256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "TransactionEffectuee",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_portefeuille",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_scoreCredit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_limiteExposition",
        "type": "uint256"
      }
    ],
    "name": "ajouterContrepartie",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "allCounterparties",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_portefeuille",
        "type": "address"
      }
    ],
    "name": "calculerRatioCouverture",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_portefeuille",
        "type": "address"
      }
    ],
    "name": "calculerRisque",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "contreparties",
    "outputs": [
      {
        "internalType": "address",
        "name": "portefeuille",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "scoreCredit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "limiteExposition",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "expositionCourante",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "collateral",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "estActif",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "int256",
        "name": "_montant",
        "type": "int256"
      }
    ],
    "name": "effectuerTransaction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllCounterparties",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_portefeuille",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_nouveauCollateral",
        "type": "uint256"
      }
    ],
    "name": "mettreAJourCollateral",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_portefeuille",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_nouvelleExposition",
        "type": "uint256"
      }
    ],
    "name": "mettreAJourExposition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "netExpositions",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];


// Function to Connect Wallet
async function connectWallet() {
  try {
      if (!window.ethereum) {
          alert("MetaMask or a compatible wallet is required!");
          return;
      }

      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, contractABI, signer);

      const userAddress = await signer.getAddress();
      connectWalletBtn.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
      connectWalletMsg.textContent = "Wallet connected.";
      connectWalletBtn.style.display = "none";

      // Show app content and enable menu
      appContent.style.display = "block";
      menuIcon.style.display = "block";
  } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
  }
}

// Toggle Sidebar
function toggleSidebar() {
    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        darkOverlay.style.display = "none";
    } else {
        sidebar.classList.add("open");
        darkOverlay.style.display = "block";
    }
}

// Switch Between Sections
function switchSection(section) {
    document.querySelectorAll("main > section").forEach((sec) => {
        sec.style.display = "none";
    });
    section.style.display = "block";
}

// Add Counterparty
async function addCounterparty() {
    const address = document.querySelector("#counterpartyAddress").value.trim();
    const creditScore = Number(document.querySelector("#creditScore").value.trim());
    const exposureLimit = Number(document.querySelector("#exposureLimit").value.trim());

    if (!ethers.utils.isAddress(address)) {
        alert("Invalid Ethereum address.");
        return;
    }
    if (creditScore <= 0 || isNaN(creditScore)) {
        alert("Credit Score must be a positive number.");
        return;
    }
    if (exposureLimit <= 0 || isNaN(exposureLimit)) {
        alert("Exposure Limit must be a positive number.");
        return;
    }

    try {
        const existingCounterparty = await contract.contreparties(address);
        if (existingCounterparty.portefeuille !== ethers.constants.AddressZero) {
            alert("This counterparty already exists.");
            return;
        }

        const tx = await contract.ajouterContrepartie(address, creditScore, exposureLimit, { gasLimit: 300000 });
        await tx.wait();
        alert("Counterparty added successfully!");
    } catch (error) {
        console.error("Error adding counterparty:", error);
        alert(`An error occurred: ${error.message || "Transaction failed"}`);
    }
}

// Update Collateral
async function updateCollateral() {
    const address = document.querySelector("#collateralAddress").value.trim();
    const newCollateral = Number(document.querySelector("#newCollateral").value.trim());

    if (!ethers.utils.isAddress(address)) {
        alert("Invalid Ethereum address.");
        return;
    }
    if (newCollateral <= 0 || isNaN(newCollateral)) {
        alert("Collateral must be a positive number.");
        return;
    }

    try {
        const tx = await contract.mettreAJourCollateral(address, newCollateral, { gasLimit: 300000 });
        await tx.wait();
        alert("Collateral updated successfully!");
    } catch (error) {
        console.error("Error updating collateral:", error);
        alert(`An error occurred: ${error.message || "Transaction failed"}`);
    }
}

// Update Exposure
async function updateExposure() {
    const counterparty = document.querySelector("#exposureCounterpartyAddress").value.trim();
    const newExposure = Number(document.querySelector("#newExposure").value.trim());

    if (!ethers.utils.isAddress(counterparty)) {
        alert("Invalid Ethereum address.");
        return;
    }
    if (newExposure <= 0 || isNaN(newExposure)) {
        alert("Exposure must be a positive number.");
        return;
    }

    try {
        const tx = await contract.mettreAJourExposition(counterparty, newExposure, { gasLimit: 300000 });
        await tx.wait();
        alert("Exposure updated successfully!");
    } catch (error) {
        console.error("Error updating exposure:", error);
        alert(`An error occurred: ${error.message || "Transaction failed"}`);
    }
}

// Calculate Risk
async function calculateRisk() {
    const address = document.querySelector("#riskAddress").value.trim();

    if (!ethers.utils.isAddress(address)) {
        alert("Invalid Ethereum address.");
        return;
    }

    try {
        const risk = await contract.calculerRisque(address);
        document.querySelector("#riskResult").textContent = `Risk: ${risk}`;
    } catch (error) {
        console.error("Error calculating risk:", error);
        alert("An error occurred while calculating risk.");
    }
}

// Setup Event Listeners
function setupEventListeners() {
    if (!contract) return;

    try {
        contract.on("LimiteDepassee", (contrepartie, expositionActuelle, limiteExposition) => {
            alert(`Limit exceeded for ${contrepartie}: ${expositionActuelle}/${limiteExposition}`);
        });

        contract.on("AlerteRisque", (contrepartie, typeAlerte, valeur) => {
            alert(`Risk alert for ${contrepartie}: ${typeAlerte} - Value: ${valeur}`);
        });
    } catch (error) {
        console.error("Error setting up event listeners:", error);
    }
}

// Function to Calculate Coverage Ratio
async function calculateCoverage() {
  const address = document.querySelector("#coverageRatioAddress").value.trim();

  if (!ethers.utils.isAddress(address)) {
      alert("Invalid Ethereum address.");
      return;
  }

  try {
      const ratio = await contract.calculerRatioCouverture(address);
      document.querySelector("#coverageRatioResult").textContent = `Coverage Ratio: ${ratio}%`;
  } catch (error) {
      console.error("Error calculating coverage ratio:", error);
      alert("An error occurred while calculating coverage ratio.");
  }
}

// Perform Transaction
async function performTransaction() {
  const toAddress = document.querySelector("#transactionToAddress").value.trim();
  const amount = Number(document.querySelector("#transactionAmount").value.trim());

  // Input Validation
  if (!ethers.utils.isAddress(toAddress)) {
      alert("Invalid Ethereum address.");
      return;
  }
  if (amount <= 0 || isNaN(amount)) {
      alert("Amount must be a positive number.");
      return;
  }

  try {
      const tx = await contract.effectuerTransaction(toAddress, amount, { gasLimit: 300000 });
      await tx.wait();
      alert("Transaction performed successfully!");
  } catch (error) {
      console.error("Error performing transaction:", error);
      alert(`An error occurred: ${error.message || "Transaction failed"}`);
  }
}

// Show Counterparty Info
async function showInfo() {
  const address = document.querySelector("#infoAddress").value.trim();

  if (!ethers.utils.isAddress(address)) {
      alert("Invalid Ethereum address.");
      return;
  }

  try {
      const info = await contract.contreparties(address);
      document.querySelector("#infoResult").innerHTML = `
          <strong>Address:</strong> ${info.portefeuille}<br>
          <strong>Credit Score:</strong> ${info.scoreCredit}<br>
          <strong>Exposure Limit:</strong> ${info.limiteExposition}<br>
          <strong>Current Exposure:</strong> ${info.expositionCourante}<br>
          <strong>Collateral:</strong> ${info.collateral}<br>
          <strong>Is Active:</strong> ${info.estActif ? "Yes" : "No"}
      `;
  } catch (error) {
      console.error("Error fetching counterparty info:", error);
      alert("An error occurred while fetching counterparty info.");
  }
}


// Function to Toggle Sidebar
function toggleSidebar() {
  const isOpen = sidebar.classList.toggle("open");
  darkOverlay.style.display = isOpen ? "block" : "none";
}

// Function to Switch Between Sections
function switchSection(sectionId) {
  Object.values(sections).forEach((sec) => (sec.style.display = "none"));
  if (sections[sectionId]) sections[sectionId].style.display = "block";
}

// Attach Event Listeners
function setupEventListeners() {
  connectWalletBtn?.addEventListener("click", connectWallet);
  menuIcon?.addEventListener("click", toggleSidebar);
  darkOverlay?.addEventListener("click", toggleSidebar);

  sidebarLinks.addCounterpartyLink?.addEventListener("click", () => switchSection("addCounterparty"));
  sidebarLinks.updateExposureLink?.addEventListener("click", () => switchSection("updateExposure"));
  sidebarLinks.calculateRiskLink?.addEventListener("click", () => switchSection("calculateRisk"));
  sidebarLinks.updateCollateralLink?.addEventListener("click", () => switchSection("updateCollateral"));
  sidebarLinks.calculateCoverageLink?.addEventListener("click", () => switchSection("calculateCoverage"));
  sidebarLinks.showInfoLink?.addEventListener("click", () => switchSection("showInfo"));
  sidebarLinks.performTransactionLink?.addEventListener("click", () => switchSection("performTransaction"));

  buttons.addCounterpartyBtn?.addEventListener("click", addCounterparty);
  buttons.updateExposureBtn?.addEventListener("click", updateExposure);
  buttons.calculateRiskBtn?.addEventListener("click", calculateRisk);
  buttons.updateCollateralBtn?.addEventListener("click", updateCollateral);
  buttons.calculateCoverageBtn?.addEventListener("click", calculateCoverage);
  buttons.showInfoBtn?.addEventListener("click", showInfo);
  buttons.performTransactionBtn?.addEventListener("click", performTransaction);
}

// Initialize the Application
setupEventListeners();
connectWalletMsg.textContent = "Please connect your wallet to continue.";