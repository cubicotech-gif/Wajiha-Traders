# Wajeeha Traders

A simple inventory and sales management app for Wajeeha Traders.

## Features

- Products (add / edit / delete with stock tracking)
- Customers (add / edit / delete)
- Sales (create bills, auto-decrement stock, track paid/pending)
- Dashboard with today's sales and outstanding totals

## Tech

- Next.js 14 + TypeScript + Tailwind CSS
- Data stored in browser localStorage (no backend needed)
- Works offline — just open it and use it

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Notes

All data is saved in the browser under the `wt_` prefix in localStorage.
Clearing browser data will reset the app.
