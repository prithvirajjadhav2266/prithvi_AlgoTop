# 🎟️ AlgoSphere - Decentralized Campus Event Ticketing on Algorand

> **Hackathon Submission | Round 1**
> Built using AlgoKit, PyTEAL, and React - by students, for students.

---

## 🚨 Problem Statement

Managing campus events today is often fragmented and opaque:

* Clubs collect payments manually or through external platforms.
* Tickets can be duplicated or forged.
* No verifiable record of attendance.
* Event organization lacks transparency and trust.

These issues make event management inefficient and erode student trust.

---

## 🌟 Our Solution - AlgoSphere

AlgoSphere is a fully decentralized event ticketing platform built on the Algorand blockchain. It empowers university clubs to:

* ✅ Register officially on-chain.
* 🧾 Create tamper-proof events.
* 🎫 Mint tickets as Algorand Standard Assets (ASAs / NFTs).
* 💰 Sell tickets to students using ALGO.
* 🎟️ Let students store tickets in their wallets.
* 🛂 Verify ticket ownership at entry.

### 💡 Key Innovations

* Built fully on-chain using **PyTEAL** smart contracts
* **Tickets are ASAs (NFTs)** - no duplication, no forgery
* **Wallet-based identity** - no signup, just connect wallet
* **Transparent event ledger** for admins and clubs

---

## 🏛️ Example Use Case: MLSC Club Hackathon

The **MLSC club** at our university is organizing "Hexpiration 26" - a 24-hour blockchain hackathon.

1. They register on AlgoSphere.
2. They create the event: "Hexpiration 26", 3 ALGO per ticket.
3. 50 NFT tickets are minted and listed for sale.
4. Students connect their wallet and buy a ticket with ALGO.
5. At check-in, students scan a QR code to verify ticket ownership.

> 🎉 No middlemen. No forged entries. Transparent on-chain record.

---

## 🔗 Tech Stack

| Layer          | Tech                            |
| -------------- | ------------------------------- |
| Blockchain     | **Algorand (TestNet)**          |
| Smart Contract | PyTEAL + AlgoKit                |
| Frontend       | React 18 + Vite + TypeScript    |
| Wallet         | Pera Wallet (via WalletConnect) |
| Assets         | ASA (NFT Tickets)               |
| Hosting        | Vercel / LocalNet               |

---

## 🧠 Tokenomics & Design

| Action         | Cost (User) | ALGO Flow            |
| -------------- | ----------- | -------------------- |
| Club registers | ~0 ALGO     | Fee paid to deployer |
| Create event   | ~0 ALGO     | Ticket ASA minted    |
| Buy ticket     | 0.001 ALGO* | Payment to club      |
| Verify ticket  | 0 ALGO      | Read-only on-chain   |

> *We use micro-ALGO transfers for testing/demo purposes. Ticket prices are reduced for demo flow.*

---

## 📸 Screenshots

> Add screenshots below in final version:

* ✅ Landing Page
* <img width="1600" height="761" alt="image" src="https://github.com/user-attachments/assets/43a98e45-2079-4a6c-b709-1dee934992f9" />

* ✅ Club Registration Model
*   <img width="839" height="806" alt="image" src="https://github.com/user-attachments/assets/85b69eb7-c31f-475a-8763-28091f5685ee" />

* ✅ Event Creation Form
* <img width="1600" height="752" alt="image" src="https://github.com/user-attachments/assets/8b5bc0e6-e716-44a0-b56a-775fc1c9963a" />

* ✅ On-Chain Ledger View
* <img width="1600" height="763" alt="image" src="https://github.com/user-attachments/assets/e75f22fa-747c-4132-9b97-a72f5e956a9d" />


---

## 🚀 Setup Instructions

### ⚙️ Prerequisites

* Node.js 18+
* Python 3.12+
* Docker
* AlgoKit 2.0+

### 🧱 Smart Contract Deployment

```bash
# Start LocalNet
algokit localnet start

# Deploy Contract
cd projects/contracts
algokit project deploy localnet
# NOTE: Copy the APP_ID printed in the terminal
```

### 🎨 Frontend Setup

```bash
cd projects/frontend
npm install

# Update .env file
cp .env.example .env
# Add your VITE_TICKETING_APP_ID=<copied_id> from above
```

```bash
# Start the frontend
npm run dev
```

---

## 🔐 Smart Contract Functions

* `register_club(name, contact)`
* `create_event(name, venue, date, price, quantity)`
* `buy_ticket(event_id)`
* `verify_ticket(event_id, wallet)`
* `get_event_details(event_id)`
* `get_total_events()`

---

## 🎯 MVP Completion Checklist

* [x] Club Registration ✅
* [x] Create Event ✅
* [x] Mint NFT Tickets ✅
* [x] Buy Ticket w/ ALGO ✅
* [x] Verify Ownership ✅
* [ ] Event Dashboard UI ⏳
* [ ] Real-time ledger view ⏳

---

## 👨‍💻 Developer Mode

For testing purposes, ticket prices have been reduced to **0.001 ALGO**. Events are deployed on **LocalNet** with mock clubs and demo tickets to ensure judges can experience the flow end-to-end without draining TestNet faucets.

---

## 📩 Contact & Credit

Built with ❤️ by students from [Vishwakarma Institute of Technology, Pune].
Lead Dev: [Prithviraj Jadhav]
Mail: [prithviw2004@gmail.com](mailto:prithviw2004@gmail.com)

---

## 📜 License

MIT License. Fully open source under `/projects/`.
