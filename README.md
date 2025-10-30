# Portfolio Tracker Dashboard

A **real-time stock portfolio dashboard** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **React Table**.  
Fetches live market data (CMP, P/E, Earnings, etc) from your **Node.js backend** and updates every **15 seconds**.

Live Demo: [https://your-portfolio-tracker.vercel.app](https://stack-portfolio-pi.vercel.app/) 

---

## Features

| Feature | Status |
|-------|--------|
| Live Stock,	Buy Price,	Qty,	Invested,	CMP,	Value,	Gain/Loss,	P/E,	Exchange,	Portfolio (%),	Latest Earnings | ✅ |
| Auto-refresh every 15s | ✅ |
| Sector grouping with accordion | ✅ |
| Green/Red Gain/Loss | ✅ |
| Performance optimized (`React.memo`, `useMemo`) | ✅ |
| Responsive (mobile + desktop) | ✅ |
| Clean, modern UI | ✅ |

---

## Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **Table** | `react-table` |
| **Backend** | Node.js + Express |
| **Data** | Yahoo Finance |

---


---

## Prerequisites

- Node.js ≥ 18
---

## Setup & Installation

### 1. Clone the repo

```bash
git clone https://github.com/krishna7054/Stack-Portfolio.git
cd Stack-Portfolio
```
## Backend:
```bash
cd backend
```
### 2. Install dependencies
```bash
npm install
```

### 3. Configure API URL
Create .env.local in the backend/ folder:
```bash
PORT=4000
CACHE_TTL_SECONDS=15
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
```

### 4. Run the app
```bash
npm run dev
```
- Your **backend API** running at `http://localhost:4000`

## Frontend

### 2. Install dependencies
```bash
npm install
```

### 3. Configure API URL
Create .env.local in the frontend/ folder:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run the app
```bash
npm run dev
```
- Your **frontend** running at `http://localhost:3000`

## Screenshot
<img width="1912" height="972" alt="image" src="https://github.com/user-attachments/assets/b9bf501d-6a80-4338-8439-264c254543ec" />
