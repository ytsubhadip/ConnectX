# ConnectX

ConnectX is a modern networking and document intelligence platform built for collaboration, professional connections, and AI-powered document Q&A. Users can register and log in, build their network by sending and accepting connection requests, upload PDF documents, ask questions about the content of those documents, manage subscriptions and wallet credits, and even start video calls with accepted connections.

The project is split into a FastAPI backend and a React frontend, making it easy to extend with new features, dashboards, and integrations.

## Features

- User registration and login
- Admin registration and admin dashboard access
- Connection requests and accepted connections
- User discovery and profile-based networking
- PDF upload and text extraction
- AI-powered document Q&A using vector search / retrieval flow
- Subscription plans and wallet balance tracking
- Video call initiation and WebSocket-based live call communication
- Dashboard views for users and administrators

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- MySQL database via `MYSQL_URI`
- JWT authentication
- WebSockets for real-time calls

### Frontend
- React
- Vite
- React Router
- Axios for API communication

## Project Structure

```text
ConnectX/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   ├── routes/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── public/
├── README.md
├── .gitignore
└── LICENSE
```

## Local Installation

### 1. Clone the repository

```bash
https://github.com/ytsubhadip/ConnectX.git
cd ConnectX
```

### 2. Set up the backend

```bash
cd backend
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder and add your database settings:

```env
MYSQL_URI=mysql://username:password@host:port/database_name
admin email=admin@gmail.com
admin password=admin1234
```

Then start the backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will run at:

```text
http://localhost:8000
```

### 3. Set up the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

## API Routes

Base URL for local development:

```text
http://localhost:8000
```

### Health Check

- `GET /` — checks if the backend is running

### Authentication

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — login a user
- `POST /api/auth/admin-register` — register an admin user
- `POST /api/auth/admin-login` — login as admin

### Connections

- `GET /api/connection/users` — list users available to connect
- `POST /api/connection/request/{receiver_id}` — send a connection request
- `GET /api/connection/requests` — list incoming connection requests
- `POST /api/connection/accept/{connection_id}` — accept a request
- `POST /api/connection/reject/{connection_id}` — reject a request
- `GET /api/connection/connected` — get accepted connections

### Documents and AI Q&A

- `GET /api/document/` — get documents for the logged-in user
- `POST /api/document/upload` — upload a PDF document
- `POST /api/document/ask` — ask a question about a uploaded document

### Subscriptions and Wallet

- `GET /api/subscription/plans` — get available subscription plans
- `POST /api/subscription/subscribe/{plan_id}` — subscribe to a plan
- `GET /api/subscription/wallet` — check wallet balance
- `GET /api/subscription/wallet/transactions` — get wallet transaction history

### Video Calls

- `POST /api/call/start/{connection_id}` — start a call with a connected user
- `POST /api/call/end/{call_id}` — end a call
- `WS /api/call/ws/{call_id}` — WebSocket endpoint for live call signaling

### Admin Routes

- `GET /api/admin/stats` — summary statistics for the admin dashboard
- `GET /api/admin/users` — list all users
- `GET /api/admin/users/{user_id}` — fetch user details
- `GET /api/admin/subscription` — list active subscriptions
- `GET /api/admin/wallets` — list wallet balances
- `GET /api/admin/documents` — list uploaded documents
- `GET /api/admin/connections` — list connection history

## Authentication

Protected API routes require a bearer token in the request header:

```http
Authorization: Bearer <your_access_token>
```

## Notes

- The frontend API client is configured in `frontend/src/service/API.js`.
- For local development, change the base URL to `http://localhost:8000` if needed.
- Production deployment uses a hosted backend URL, so the frontend may point to the deployed API unless configured otherwise.

## Example Workflow

1. Register a user or admin.
2. Log in and get an access token.
3. Send a connection request to another user.
4. Accept or reject incoming requests.
5. Upload a PDF document.
6. Ask questions about the document.
7. Subscribe to a payment plan and track wallet credits.
8. Start a video call with a connected user.


