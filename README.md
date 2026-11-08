# SmallWeb — Personal Web Browser

SmallWeb is a browser-like web application built as a full-stack technical assessment. It allows multiple seeded people to browse fictional websites stored in MongoDB, navigate between pages, search website content, publish new websites, and maintain individual browsing histories.

The application does not access the real internet. All websites are stored in the application's database.

## Features

- **Person selection:** Switch between seeded users, each with an independent browsing history.
- **Address bar:** Navigate to websites using their addresses.
- **Website navigation:** Follow internal links between stored websites.
- **Broken links:** Display a broken-page state for addresses that do not exist.
- **Back and Forward:** Navigate through browsing history. Starting a new navigation after going back discards the forward history branch.
- **History management:** View previous visits and jump to a selected history entry.
- **Scroll restoration:** Restore the previous scroll position when navigating Back or Forward.
- **Website search:** Search website titles and page content.
- **Website publishing:** Publish a new website by providing its address, title, and HTML content.
- **HTML sanitization:** Sanitize submitted HTML on the backend before storing it.
- **Seed data:** Populate MongoDB with sample people, websites, links, and browsing histories.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | NestJS 12, TypeScript |
| Database | MongoDB |
| ODM | Mongoose |
| HTML sanitization | sanitize-html |

## Project Structure

```text
smallweb/
├── backend/
│   ├── src/
│   │   ├── people/
│   │   ├── sites/
│   │   ├── history/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── patches/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       └── globals.css
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Community Server

Make sure the MongoDB service is running before starting the backend or seeding the database.

The backend uses this local MongoDB connection by default:

```text
mongodb://127.0.0.1:27017/smallweb
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/HasnainAbbasi1/smallweb.git
cd smallweb
```

### 2. Set up the backend

Open a terminal:

```bash
cd backend
npm install
```

The backend installation runs `patch-package` through its postinstall script to apply the included dependency compatibility patch.

### 3. Seed the database

Make sure MongoDB is running, then execute:

```bash
npm run seed
```

The seed script creates sample people, websites, and browsing histories. It uses deterministic data so running the seed again does not create duplicate records.

### 4. Start the backend

```bash
npm run start:dev
```

The backend will be available at:

```text
http://localhost:3001
```

### 5. Set up the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

## API Endpoints

The backend exposes the following REST API endpoints.

### People

| Method | Endpoint | Description |
|---|---|---|
| GET | `/people` | Retrieve available people |
| POST | `/people` | Create a person |

### Websites

| Method | Endpoint | Description |
|---|---|---|
| GET | `/sites` | Retrieve websites |
| GET | `/sites/:address` | Retrieve a website by address |
| GET | `/sites/search?q=technology` | Search website titles and content |
| POST | `/sites` | Publish a new website |

### Browsing History

| Method | Endpoint | Description |
|---|---|---|
| GET | `/history/:personId` | Retrieve a person's browsing history |
| POST | `/history/:personId/navigate` | Navigate to an address |
| POST | `/history/:personId/back` | Navigate backward |
| POST | `/history/:personId/forward` | Navigate forward |
| PATCH | `/history/:personId/scroll` | Update a history entry's scroll position |

## Security Considerations

- Published HTML is sanitized on the backend before being stored.
- Unsafe HTML elements and event handlers are removed by the sanitization process.
- Website content is rendered inside a sandboxed iframe.
- The iframe does not receive `allow-same-origin` permission.
- A Content Security Policy with a nonce is used for the trusted browser bridge script.
- Website content cannot freely control the parent browser application.

## Build Commands

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## Development Notes

- The frontend runs on port `3000`.
- The backend runs on port `3001` by default.
- The backend allows CORS requests from `http://localhost:3000`.
- The backend port can be changed using the `PORT` environment variable.
- The application uses seeded people rather than authentication or user accounts.
- Browsing history is maintained separately for each selected person.

## Repository

GitHub: https://github.com/HasnainAbbasi1/smallweb

---

**SmallWeb** — A simple browser for exploring a small, database-powered web.