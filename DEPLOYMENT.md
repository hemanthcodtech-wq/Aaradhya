# AARADHYA - PRODUCTION DEPLOYMENT GUIDE

This guide details how to deploy the **Aaradhya Fashion & Fabrics** platform:
- **Backend (Node.js/Express):** Deployed on **Render**
- **Frontend (React.js/Vite):** Deployed on **Vercel**

---

## 1. BACKEND DEPLOYMENT ON RENDER

### Method A: One-Click Render Blueprint (Recommended)
1. Push your repository to **GitHub**.
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** &rarr; **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically read `render.yaml` and configure the service:
   - **Service Name:** `aaradhya-backend`
   - **Environment:** `Node`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
6. Fill in the required environment variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (you can update this once Vercel is deployed)
7. Click **Apply**. Render will build and deploy your backend.
8. Once deployed, copy your Render URL:  
   `https://<your-service-name>.onrender.com`

### Method B: Manual Web Service Setup on Render
1. Click **New +** &rarr; **Web Service**.
2. Select your repository.
3. Configure the settings:
   - **Name:** `aaradhya-backend`
   - **Region:** Any (e.g. Oregon / Singapore / Frankfurt)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGO_URI` | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/aaradhya` |
   | `JWT_SECRET` | *(Any long secure random string)* |
   | `JWT_EXPIRE` | `7d` |
   | `CLIENT_URL` | `https://your-frontend-app.vercel.app` |
5. Click **Deploy Web Service**.
6. Verify by opening:
   - `https://<your-service-name>.onrender.com/` &rarr; Status 200 JSON
   - `https://<your-service-name>.onrender.com/api/health` &rarr; Status 200 JSON

---

## 2. FRONTEND DEPLOYMENT ON VERCEL

### Step-by-Step Vercel Deployment:
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** &rarr; **Project**.
3. Select and import your GitHub repository.
4. In the configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click "Edit" and select `client` *(or leave as root; `vercel.json` supports both!)*
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-service-name>.onrender.com/api` |
6. Click **Deploy**.
7. In less than 1 minute, your application will be live at:  
   `https://<your-project>.vercel.app`

---

## 3. CONNECTING FRONTEND & BACKEND

1. Copy your live Vercel URL (e.g. `https://aaradhya-fashion.vercel.app`).
2. Go back to your **Render Dashboard** &rarr; `aaradhya-backend` &rarr; **Environment**.
3. Set `CLIENT_URL` to `https://aaradhya-fashion.vercel.app`.
4. Click **Save Changes** (Render will automatically redeploy).

---

## 4. VERIFICATION CHECKLIST

- [x] `.gitignore` created at root, `client/`, and `server/` (securing `.env` and `node_modules`).
- [x] `vercel.json` added with SPA rewrites to `/index.html` (preventing 404s on page refresh).
- [x] `render.yaml` created for instant Infrastructure-as-Code Blueprint deployment.
- [x] `server/server.js` configured with `GET /` and `GET /api/health` endpoints.
- [x] CORS configured to accept cross-origin requests from Vercel deployments.
- [x] Environment variable templates created: `server/.env.example` and `client/.env.example`.
