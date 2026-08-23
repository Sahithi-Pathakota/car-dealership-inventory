<<<<<<< HEAD
# DriveHub — Car Dealership Inventory System

A full-stack car dealership inventory system built as a TDD kata: a token-authenticated
REST API backed by SQLite, and a React + Tailwind single-page app for browsing,
searching, purchasing, and (as an admin) managing vehicle inventory.

## Project overview

- **Backend**: Node.js, TypeScript, Express, SQLite (via `better-sqlite3`), JWT auth, bcrypt password hashing.
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router.
- **Testing**: Jest + Supertest on the backend (21 tests), Vitest + React Testing Library on the frontend (7 tests).
- **Auth**: Email/password registration and login, JWT bearer tokens, `user` and `admin` roles. Admin-only actions (delete vehicle, restock) are enforced server-side, not just hidden in the UI.

### Features

- Register / log in, JWT-protected API
- Browse all vehicles; search/filter by make, category, and price range
- Purchase a vehicle (decrements stock; button disables at 0 stock)
- Admin: add, edit, delete vehicles; restock inventory
- Clean, responsive UI

## Repository structure

```
car-dealership-inventory/
├── backend/          # Express + TypeScript API, SQLite database, Jest tests
├── frontend/         # React + Tailwind SPA, Vitest tests
├── PROMPTS.md         # Raw AI chat log for this project
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+ and npm

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # adjust JWT_SECRET for anything beyond local dev
npm run dev                # starts the API on http://localhost:4000
```

The SQLite database file is created automatically at `backend/data/dealership.db`
on first run — no external database server required.

Run the backend test suite:

```bash
npm test                   # runs all Jest tests
npm run test:coverage      # runs tests with a coverage report
```

### 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env       # points the frontend at the local API by default
npm run dev                 # starts the SPA on http://localhost:5173
```

The dev server proxies `/api` requests to `http://localhost:4000`, so the two
apps talk to each other out of the box.

Run the frontend test suite:

```bash
npm test
```

### 3. Creating an admin user

The registration form always creates a `user`-role account (this is
intentional — nothing client-side should be able to self-grant admin). To
create an admin for testing, register normally, then call the API directly:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass123","role":"admin"}'
```

## API reference

| Method | Endpoint                          | Auth        | Description                          |
|--------|------------------------------------|-------------|---------------------------------------|
| POST   | `/api/auth/register`              | —           | Register a new user                   |
| POST   | `/api/auth/login`                 | —           | Log in, receive a JWT                 |
| GET    | `/api/vehicles`                   | Bearer      | List all vehicles                     |
| GET    | `/api/vehicles/search`            | Bearer      | Search by `make`, `model`, `category`, `minPrice`, `maxPrice` |
| POST   | `/api/vehicles`                   | Bearer      | Add a vehicle                         |
| PUT    | `/api/vehicles/:id`                | Bearer      | Update a vehicle                      |
| DELETE | `/api/vehicles/:id`                | Bearer + Admin | Delete a vehicle                  |
| POST   | `/api/vehicles/:id/purchase`       | Bearer      | Purchase (decrement quantity by 1)    |
| POST   | `/api/vehicles/:id/restock`        | Bearer + Admin | Restock (`{ "amount": n }`)       |

## Test report

Backend (Jest + Supertest), run locally with `npm test`:

```
Test Suites: 3 passed, 3 total
Tests: 21 passed, 21 total
Snapshots: 0 total
Time: 7.052 s


> Note: `npm run test:coverage` crashes intermittently on this machine due to
> a known native-addon cleanup issue under x64-on-ARM64 Windows emulation
> (V8 coverage instrumentation + `better-sqlite3`). The full suite passes
> reliably without coverage instrumentation, as shown above.

Frontend (Vitest + React Testing Library), run locally with `npm test`:

Test Files 2 passed (2)
Tests 7 passed (7)
Duration 1.99s



File                   | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
All files               |   90.16 |    72.72 |   96.55 |   91.62
 app.ts                 |   96.29 |      100 |   50.00 |  100.00
 controllers/auth...    |   92.85 |    81.25 |  100.00 |   92.85
 controllers/vehicle... |   85.96 |    70.00 |  100.00 |   85.96
 middleware/auth.ts     |   95.00 |   100.00 |  100.00 |   95.00
 models/User.ts         |  100.00 |    50.00 |  100.00 |  100.00
 models/Vehicle.ts      |   86.36 |    58.33 |  100.00 |   90.24
```

Frontend (Vitest + React Testing Library), run locally with `npm test`:

```
Test Files  2 passed (2)
     Tests  7 passed (7)
```

> Re-run `npm run test:coverage` / `npm test` yourself and paste your own
> output here (or a screenshot) before submitting — graders generally want to
> see your own terminal output, not a copy-pasted one.

## Screenshots

_Add screenshots of the running application here before submitting —
login screen, dashboard, search/filter in action, and the admin add/edit
forms are good ones to include._

## My AI Usage

**Which AI tools I used:** Claude (Anthropic), via the Claude web interface, as the primary
development assistant for this project.

**How I used it:**
- Asked Claude to scaffold the backend (Express + TypeScript + SQLite project structure,
  `package.json`, `tsconfig.json`, Jest config) so I could focus on the business logic.
- Had Claude generate the initial test suites for auth, vehicle CRUD, search, and
  inventory (purchase/restock) endpoints, then reviewed and ran them to confirm they
  actually exercised the right behavior (including edge cases like out-of-stock
  purchases and non-admin restock attempts).
- Used Claude to implement the corresponding controllers/models/middleware to make
  those tests pass, then to refactor (e.g., extracting the JWT middleware, tightening
  input validation).
- Had Claude scaffold the React + Tailwind frontend (routing, auth context, API client,
  components) and write component tests with Testing Library.
- Asked Claude to draft this README and the `PROMPTS.md` log.

**Reflection:**
_(Replace this paragraph with your own honest reflection before submitting — this is
the part interviewers specifically want to hear in your own words.)_ AI was most useful
for scaffolding boilerplate (config files, repetitive CRUD/test patterns) fast so I
could spend my own time on the trickier decisions — schema design, what belongs in the
service vs. controller layer, and how to structure the frontend state. I made a point
of reading every generated file, running the tests myself, and asking follow-up
questions where something seemed off, rather than accepting output blindly. The
tradeoff worth naming honestly: it's easy to end up with code you can explain in
general terms but haven't personally wrestled with line-by-line — so before submitting
I'd go back through the diff and make sure I can justify every design choice in an
interview.

## AI co-authorship in commits

Per the assignment's AI usage policy, commits where AI assistance was used include a
`Co-authored-by: Claude <noreply@anthropic.com>` trailer. See `git log` for the full
history and `PROMPTS.md` for the underlying chat log.

## Deployment (optional)

Not deployed for this submission. The backend is a standard Node/Express app
(deployable to Render, Railway, Fly.io, etc.) and the frontend is a static Vite build
(deployable to Vercel or Netlify) — `VITE_API_URL` just needs to point at the deployed
backend.
=======
# car-dealership-inventory
>>>>>>> 996390346dcfb6f0ba084256eb109f85936c56a7
