# Deployment Implementation Plan

This plan is tailored for your specific tech stack, which appears to include **Next.js** (Frontend), **Node.js with Prisma** (Backend API), and **Node.js Background Workers**, managed via **Coolify** on **AWS EC2**.

## Phase 1: Infrastructure & DNS Setup

1. **Provision EC2 Instance**
   - **Instance Type:** `t3.medium` (4 GB RAM) or larger.
   - **OS:** Ubuntu 22.04 or 24.04.
   - **Storage:** 30 GB EBS volume minimum.
   - **Swap:** Configure 2 GB of swap space to prevent out-of-memory errors.

2. **Network & Security**
   - **Elastic IP:** Allocate and attach an Elastic IP to the instance so the IP remains static across restarts.
   - **Security Group Rules:**
     - Port `22` (SSH): Restrict to your personal IP only.
     - Port `80` (HTTP): Open to the public (0.0.0.0/0).
     - Port `443` (HTTPS): Open to the public (0.0.0.0/0).
     - Port `8000` (Coolify Dashboard): Restrict to your personal IP only (temporarily needed for initial setup).

3. **DNS Configuration**
   - In your DNS provider (e.g., Cloudflare), create **A Records** pointing to your Elastic IP:
     - `app.yourdomain.com` (Frontend)
     - `api.yourdomain.com` (Backend API)
     - `coolify.yourdomain.com` (Coolify Dashboard)
   - *Note for Cloudflare:* Set these to **DNS-only (grey cloud)** initially so Let's Encrypt can successfully provision SSL certificates.

4. **Install & Configure Coolify**
   - SSH into the EC2 instance.
   - Run the Coolify installation script.
   - Create the initial admin account via `http://<Elastic-IP>:8000`.
   - In Coolify settings, set the instance domain to `https://coolify.yourdomain.com`.
   - Once HTTPS is active for the dashboard, **close port 8000** in your AWS Security Group.

---

## Phase 2: Coolify Resource Configuration
*Organize all resources within a single Project and Environment (e.g., `OIA-Website` -> `Production`) so they share the same underlying Docker network.*

1. **Deploy Redis**
   - Add via "Database → Redis".
   - **Security:** Ensure "Make publicly available" is toggled **OFF**.
   - **Configuration:** Add custom Redis config for BullMQ compatibility: `maxmemory-policy noeviction`, `appendonly yes`.
   - **URL:** Copy the internal connection URL (e.g., `redis://default:<password>@<service-name>:6379`).

2. **Deploy Backend API**
   - Source from your GitHub repository (use Dockerfile build pack for predictability).
   - **Domain:** `https://api.yourdomain.com`
   - **Ports Exposes:** `3001` (based on your `server.js` default port config).
   - **Health Check:** Enable health checks pointing to `/health` so broken deployments are automatically rolled back.

3. **Deploy Frontend (Next.js)**
   - Source from your frontend directory/repo.
   - Use Nixpacks or Dockerfile for Next.js SSR/Static building.
   - **Domain:** `https://app.yourdomain.com`

---

## Phase 3: Environment Variables
*Since frontend env vars are baked in at build time, any changes require a full redeploy, not just a restart.*

### Backend API (Includes Workers)
Ensure both services have identical values for shared resources:
```env
# Database & Redis
REDIS_URL=redis://default:<password>@<redis-internal-host>:6379
DATABASE_URL=<Supabase pooler string (IPv4-compatible), NOT the direct string>
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

# App Config
CORS_ORIGIN=https://app.yourdomain.com
NODE_ENV=production
```

### Frontend (Next.js)
*Mark these as Build Variables in Coolify.*
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Phase 4: Code & Configuration Adjustments

Before deploying, ensure the following is configured in your codebase:

1. **Host Binding:** Your backend API must listen on `0.0.0.0`, not `localhost` or `127.0.0.1`, otherwise Coolify's reverse proxy cannot route traffic to it.
2. **CORS Policy:** Configure your backend CORS to explicitly allow `https://app.yourdomain.com`. Include `credentials: true` if you are using cookies/sessions.
3. **BullMQ / ioredis Config:** Ensure your worker connection settings include `maxRetriesPerRequest: null`.
4. **Health Endpoint:** Implement a robust `/health` route in your backend:
   ```javascript
   app.get('/health', async (req, res) => {
     try {
       await redis.ping();
       await prisma.$queryRaw`SELECT 1`; // Or your DB equivalent
       res.json({ status: 'ok', redis: 'up', db: 'up' });
     } catch (e) {
       res.status(503).json({ status: 'error', message: e.message });
     }
   });
   ```

---

## Phase 5: Verification Checklist
*Run these steps in exact order to isolate and verify each connection.*

- [ ] **1. Redis Connectivity:** In Coolify, open the Redis resource → Terminal. Run `redis-cli -a <password> ping` (Expect: `PONG`). Run `redis-cli -a <password> config get maxmemory-policy` (Expect: `noeviction`).
- [ ] **2. API Health & SSL:** Run `curl -i https://api.yourdomain.com/health`. Expect a 200 OK with `redis: 'up'` and `db: 'up'`. A successful HTTPS response validates DNS and Let's Encrypt certificates.
- [ ] **3. API Logs Check:** Review backend logs in Coolify. Ensure there are no database or Redis connection loops/errors.
- [ ] **4. Worker Logs Check:** Review worker logs in Coolify. Ensure it reports it has started and is listening for jobs, with zero `ECONNREFUSED` errors.
- [ ] **5. End-to-End Queue Test:** Trigger a small test action via the API that enqueues a job. Check the worker logs to verify the job was processed successfully (verifies API → Redis → Worker pipeline).
- [ ] **6. CORS Preflight Check:** 
      ```bash
      curl -i -X OPTIONS https://api.yourdomain.com/health \
        -H "Origin: https://app.yourdomain.com" \
        -H "Access-Control-Request-Method: GET"
      ```
      Expect header: `access-control-allow-origin: https://app.yourdomain.com`.
- [ ] **7. Frontend-to-Backend Network:** Open `https://app.yourdomain.com` in a browser. Open DevTools → Network. Verify API requests are hitting `https://api.yourdomain.com` with `2xx` responses and no CORS/mixed-content errors.
- [ ] **8. Full Application Flow:** Log in (if applicable) and perform a core action that updates the DB and triggers a background worker job.

---

## Phase 6: Long-Lived Operations & Maintenance

- **Auto-Deploy:** Connect your GitHub repository via Coolify's GitHub App or webhooks so pushes to your deployment branch (e.g., `main` or `qa`) trigger automatic redeployments.
- **Secure the Dashboard:** Enforce 2FA on your Coolify admin account. Ensure port `8000` remains closed at the AWS level.
- **Backups:** 
  - Enable Coolify's scheduled backups to an AWS S3 bucket for its configuration data.
  - Rely on Supabase's managed backups for your PostgreSQL data.
- **Snapshots & Alarms:**
  - Schedule periodic AWS EBS snapshots.
  - Configure AWS Budget alarms.
  - Set up CloudWatch alarms for EC2 Status Checks and Disk Usage (> 80%).
- **Disk Cleanup:** Enable Coolify's scheduled Docker cleanup tasks to prune unused images and prevent disk exhaustion.
- **Resource Limits:** In Coolify, set explicit memory and CPU limits on your API and Worker containers so a memory leak in one doesn't crash the entire EC2 instance.
