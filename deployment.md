# Deployment guide (Docker + GitHub Actions + VPS)

This project is deployed as a single Docker container that serves:

- The **FastAPI** backend
- The built **React/Vite** frontend (served as static files by the backend)

Deployment is automated via **GitHub Actions** and **GitHub Container Registry (GHCR)**, then rolled out to your **VPS** over SSH.

---

## 1. Prerequisites on the VPS

On your VPS (Ubuntu/Debian or similar):

1. **Install Docker**

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
```

Log out and back in so the `docker` group takes effect.

2. **(Optional) Configure a firewall / reverse proxy**

- The pipeline maps the container as `-p 8002:8001` (host 8002 → container 8001).
- Typical Nginx setup: listen on `80` and `proxy_pass http://127.0.0.1:8002`.

---

## 2. GitHub secrets (CI/CD configuration)

All sensitive config is read from **GitHub Secrets**, not from files in the repo.

Go to **GitHub → Settings → Secrets and variables → Actions → New repository secret** and create the following:

### 2.1 VPS / SSH access

- **`VPS_HOST`**: Public IP or hostname of your VPS (e.g. `76.13.19.154`)
- **`VPS_USER`**: SSH user (e.g. `devauto_vps_user`)
- **`VPS_PORT`**: SSH port (usually `22`)
- **`VPS_SSH_KEY`**: Private SSH key that can log into the VPS (PEM/OPENSSH format, multi-line value)
- **`DEPLOY_DIR`**: Directory on the VPS where deploy runs (e.g. `/var/www/devauto`)

### 2.2 SonarQube (code analysis)

- **`SONAR_PROJECT_KEY`**: SonarQube project key (e.g. `devauto_backend`)
- **`SONAR_TOKEN`**: SonarQube user or project token (from your SonarQube server)
- **`SONAR_HOST_URL`**: SonarQube server URL (e.g. `http://76.13.19.154:9090`)

### 2.3 GHCR (container registry) access

No extra secrets needed. The workflow uses GitHub’s default **`GITHUB_TOKEN`** and **`github.actor`** to log in to GHCR both when pushing the image (build job) and when pulling it on the VPS (deploy job).

### 2.4 Application configuration (env vars)

These values are injected into the container at runtime.

**Option A – full database URL**

- **`DATABASE_URL`**: Full MySQL connection string, e.g.  
  `mysql+pymysql://db_user:db_password@db_host:3306/db_name`

**Option B – build from parts (if `DATABASE_URL` is not set)**

- **`DB_HOST`**: MySQL host (e.g. `localhost` or RDS endpoint)
- **`DB_DATABASE`**: Database name (e.g. `devauto_db`)
- **`DB_USERNAME`**: Database user (e.g. `devauto_db_user`)
- **`DB_PASSWORD`**: Database password

**Other app secrets**

- **`SECRET_KEY`**: Long random string used for JWT signing
- **`JWT_ALGORITHM`**: Usually `HS256`
- **`ACCESS_TOKEN_EXPIRE_MINUTES`**: e.g. `30`
- **`REFRESH_TOKEN_EXPIRE_MINUTES`**: e.g. `10080` (7 days)
- **`CORS_ORIGINS`**: Comma-separated list of allowed origins (e.g. `http://localhost:5173,https://yourdomain.com`)

---

## 3. Docker image (local build overview)

The `Dockerfile` in the repo does the following:

1. **Build frontend**

   - Uses `node:20-alpine`
   - Installs frontend dependencies and runs `npm run build`
   - Produces `frontend/dist`

2. **Build backend image**

   - Uses `python:3.11-slim`
   - Installs Python dependencies from `requirements.txt` / `app/requirements.txt`
   - Copies `app/`, `alembic/`, `alembic.ini`, and `frontend/dist`
   - On container start:
     - Runs `alembic upgrade head`
     - Starts `uvicorn app.main:app --host 0.0.0.0 --port 8001`

Local build example (optional):

```bash
docker build -t hrms-lite:local .
docker run --rm -p 8002:8001 \
  -e DATABASE_URL="mysql+pymysql://..." \
  -e SECRET_KEY="your-secret" \
  -e JWT_ALGORITHM="HS256" \
  -e ACCESS_TOKEN_EXPIRE_MINUTES="30" \
  -e REFRESH_TOKEN_EXPIRE_MINUTES="10080" \
  -e CORS_ORIGINS="http://localhost:5173" \
  hrms-lite:local
```

---

## 4. GitHub Actions workflow (CI/CD)

The workflow is defined at:

- `.github/workflows/deploy.yml`

### 4.1 Trigger

- Runs on every **push to `master`**.

### 4.2 Job: sonar

- Runs SonarQube analysis using `SONAR_PROJECT_KEY`, `SONAR_TOKEN`, and `SONAR_HOST_URL`.
- Uses `sonar-project.properties` in the repo (project key can be overridden by the secret).

### 4.3 Job: build-and-push

- Checks out the repo
- Logs in to **GHCR** using the built-in `GITHUB_TOKEN`
- Builds the Docker image from the root `Dockerfile`
- Pushes the image as:

```text
ghcr.io/<owner>/<repo>:latest
```

### 4.4 Job: deploy

- Runs after `build-and-push` succeeds.
- **Deploys the app to your VPS by running it in a dedicated Docker container** named `hrms-lite` (no app code copied to the VPS; only the pre-built image is pulled and run).
- Uses `appleboy/ssh-action` to:

  1. SSH into the VPS using `VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_KEY`
  2. Create and use `DEPLOY_DIR` on the VPS (e.g. `/var/www/devauto`)
  3. Log in to GHCR using the default `GITHUB_TOKEN` and `github.actor`
  4. Pull the latest image
  5. Stop and remove any existing `hrms-lite` container (without touching any other containers on the VPS).  
     If some other container is already using host port `8002`, the deploy **fails with an error** instead of stopping it, so existing workloads are not disturbed.
  6. Run a new container with env vars from secrets:  
     If `DATABASE_URL` is set, it is used; otherwise `DATABASE_URL` is built from `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.

  ```bash
  docker run -d --name hrms-lite --restart unless-stopped \
    -p 8002:8001 \
    -e DATABASE_URL="${DATABASE_URL}" \
    -e SECRET_KEY="${SECRET_KEY}" \
    -e JWT_ALGORITHM="${JWT_ALGORITHM}" \
    -e ACCESS_TOKEN_EXPIRE_MINUTES="${ACCESS_TOKEN_EXPIRE_MINUTES}" \
    -e REFRESH_TOKEN_EXPIRE_MINUTES="${REFRESH_TOKEN_EXPIRE_MINUTES}" \
    -e CORS_ORIGINS="${CORS_ORIGINS}" \
    ghcr.io/<owner>/<repo>:latest
  ```

---

## 5. End-to-end setup steps

1. **Prepare VPS**

   - Install Docker
   - Ensure port `8001` (or your reverse proxy) is reachable

2. **Configure GitHub Secrets**

   - Add all secrets listed in **Section 2** (no GHCR PAT needed; the workflow uses the default token)

3. **Push to `master`**

   - Commit the Dockerfile and workflow
   - Push to `master`
   - GitHub Actions will:
     - Build and push the Docker image to GHCR
     - SSH to the VPS
     - Pull and run the updated container

4. **Access the app**

- The container is run with `-p 8002:8001` (app on host port 8002). With Nginx listening on port 80 and `proxy_pass http://127.0.0.1:8002`, the app is available at:

  ```text
  http://<VPS_HOST>/
  ```

- If not using Nginx, use `http://<VPS_HOST>:8002` (direct to container).

---

## 6. Updating the app

To deploy new changes:

1. Commit and push to the `master` branch.
2. Wait for the **“CI/CD - Build and Deploy to VPS”** workflow to finish.
3. The running container on the VPS will be replaced with the newly built image.

