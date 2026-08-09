# Aira — AI Personal Healthcare Copilot

Aira helps people log symptoms and vitals, chat with a context-aware AI about how
they're feeling, and understand when something is worth a doctor's attention —
without ever pretending to be a diagnosis engine.

## Demo / Try It Out

If you want to try Aira on your own, you can either:
- **Create your own account** in the application, or
- **Log in using the demo credentials**:
  - **Email**: `thehackerguy299@outlook.com`
  - **Password**: `12345678`

```
aira-health/
├── frontend/            React + TypeScript + Vite + Three.js (react-three-fiber)
├── backend/              TypeScript Vercel serverless functions (Groq + Gemini)
├── firebase.json         Firebase project config
├── firestore.rules       Per-user data isolation rules
└── firestore.indexes.json
```

## Stack

| Layer        | Choice                                                         |
|--------------|------------------------------------------------------------------|
| Frontend     | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion       |
| 3D/animation | Three.js via `@react-three/fiber` + `@react-three/drei`          |
| AI           | Groq (`llama-3.3-70b-versatile`, primary) → Gemini 3.5 Flash (fallback) |
| Auth + DB    | Firebase Authentication + Firestore                              |
| Backend      | TypeScript Vercel serverless functions (`/api/*`)                |
| Deployment   | Vercel (frontend project + backend project), Firebase (Firestore only) |

## How the pieces fit together

1. **Frontend** is a Vite SPA. It talks to Firebase directly from the browser
   for auth and all data reads/writes (Firestore security rules enforce that a
   user can only ever touch their own documents — see `firestore.rules`).
2. For anything requiring an LLM (chat replies, symptom triage, daily
   insights), the frontend calls the **backend**'s `/api/*` endpoints, sending
   the Firebase ID token as a bearer header.
3. The **backend** verifies that token with Firebase Admin, builds a system
   prompt from the user's health profile, and calls Groq first. If Groq is
   unavailable (missing key, rate limit, network error) it transparently
   retries the same request against Gemini 3.5 Flash.
4. AI replies never get written to Firestore by the backend — the frontend
   persists chat/log data via the client SDK, so the backend stays stateless
   and easy to scale.

## Local development

### 1. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** → Sign-in method → Email/Password and Google.
3. Enable **Firestore Database** (production mode is fine — rules are provided).
4. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # select your project
   firebase deploy --only firestore:rules,firestore:indexes
   ```
5. Grab your web app config from Project settings → General → Your apps, and
   a service account key from Project settings → Service accounts → Generate
   new private key.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# fill in GROQ_API_KEY, GEMINI_API_KEY, and the FIREBASE_* admin credentials
npm run dev        # starts on http://localhost:8787
```

Get free API keys:
- Groq: [console.groq.com/keys](https://console.groq.com/keys)
- Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# fill in the VITE_FIREBASE_* values (VITE_API_BASE_URL can stay empty locally —
# Vite proxies /api to http://localhost:8787 automatically)
npm run dev         # starts on http://localhost:5173
```

Open `http://localhost:5173`, sign up, and start logging.

## Deployment

Each folder is an independent Vercel project.

### Backend → Vercel

```bash
cd backend
vercel
```

In the Vercel dashboard, set these environment variables for the project:
`GROQ_API_KEY`, `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`,
`FIREBASE_PRIVATE_KEY` (keep the `\n` sequences literal), and
`CORS_ALLOWED_ORIGIN` set to your deployed frontend URL once you have it.

### Frontend → Vercel

```bash
cd frontend
vercel
```

Set the `VITE_FIREBASE_*` variables plus `VITE_API_BASE_URL` (your backend's
Vercel URL + `/api`, e.g. `https://aira-backend.vercel.app/api`) in the Vercel
dashboard, then redeploy so the build picks them up.

Finally, go back to the backend project's `CORS_ALLOWED_ORIGIN` and set it to
your frontend's production URL, then redeploy the backend.

## Safety design notes

Aira is a wellness copilot, not a diagnostic device. This is enforced in a few
concrete ways, not just as marketing copy:

- The system prompt (`backend/lib/prompts.ts`) explicitly forbids diagnosis,
  prescribing, or telling someone to alter existing treatment.
- A deterministic keyword check (`backend/lib/urgency.ts`,
  `backend/api/triage.ts`) flags likely-emergency phrasing and overrides the
  model's own urgency tag — the UI doesn't rely solely on the LLM to notice.
- The chat UI shows a persistent emergency banner the moment urgent language
  is detected, independent of what the model says next.
- Firestore rules ensure no user can ever read another user's health data.

## Known limitations / next steps

- Chat responses are not streamed token-by-token (single request/response);
  streaming would reduce perceived latency further.
- Groq/Gemini rate limits on free tiers are shared across all users of a
  deployed instance — add per-user rate limiting before any real launch.
- No push notifications for medication reminders yet (data model in
  `MedicationEntry` supports `timeOfDay`, but no scheduler is wired up).
