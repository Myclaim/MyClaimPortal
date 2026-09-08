# Hostinger Deployment Guide for Single Backend & Dual Frontend

This guide explains how to host your single backend API and both frontend applications on a **Hostinger VPS** (Ubuntu 22.04 or 24.04).

---

## 1. Domain & DNS Configuration

In your domain registrar / Hostinger DNS Zone for both domains, configure the following `A` records pointing to your **Hostinger VPS IP**:

| Type | Name / Host | Target / Value | Destination |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `<YOUR_VPS_IP>` | `wealthearth.com` |
| **A** | `www` | `<YOUR_VPS_IP>` | `www.wealthearth.com` |
| **A** | `api` | `<YOUR_VPS_IP>` | `api.wealthearth.com` (Backend API) |
| **A** | `@` | `<YOUR_VPS_IP>` | `myclaimindia.com` |
| **A** | `www` | `<YOUR_VPS_IP>` | `www.myclaimindia.com` |

---

## 2. Server Initial Setup (on Hostinger VPS)

Connect via SSH to your Hostinger VPS:

```bash
ssh root@<YOUR_VPS_IP>
```

Update system packages and install Node.js (v20 LTS), Nginx, and PM2:

```bash
# Update Ubuntu
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# Install PM2 globally to keep the backend running 24/7
sudo npm install -g pm2
```

---

## 3. Directory Layout on VPS

Create separate directories for the backend and both frontend builds:

```bash
sudo mkdir -p /var/www/myclaim-backend
sudo mkdir -p /var/www/wealthearth-frontend
sudo mkdir -p /var/www/myclaimindia-frontend
```

---

## 4. Deploying the Backend

Upload or clone your project into `/var/www/myclaim-backend`:

```bash
cd /var/www/myclaim-backend

# Install production dependencies
npm install --production

# Create .env file
nano .env
```

Ensure your `/var/www/myclaim-backend/.env` has:
```env
PORT=5005
MONGO_URI=mongodb://Myclaim:Mycl%40im@ac-snd7ugc-shard-00-00.fcdwzd7.mongodb.net:27017,ac-snd7ugc-shard-00-01.fcdwzd7.mongodb.net:27017,ac-snd7ugc-shard-00-02.fcdwzd7.mongodb.net:27017/myclaim?ssl=true&replicaSet=atlas-jvkq94-shard-0&authSource=admin&appName=Cluster0
JWT_SECRET=your_super_secure_production_secret
NODE_ENV=production
```

Start the backend with PM2:
```bash
pm2 start server.js --name "api-service"
pm2 save
pm2 startup
```

---

## 5. Building & Deploying the Frontends

You can either build locally on your machine and upload the `dist/` folders, or build directly on the VPS:

### Option A: Build on your local machine and upload

In your local `frontend` directory:

1. **Build for WealthEarth (Super Admin, Admin, Employee, Super Partner, Partner)**:
   ```bash
   npm run build:wealthearth
   ```
   This generates `frontend/dist/`. Copy this folder to `/var/www/wealthearth-frontend`:
   ```bash
   scp -r dist/* root@<YOUR_VPS_IP>:/var/www/wealthearth-frontend/
   ```

2. **Build for MyClaim India (Client Portal)**:
   ```bash
   npm run build:myclaim
   ```
   This generates the client `frontend/dist/`. Copy this folder to `/var/www/myclaimindia-frontend`:
   ```bash
   scp -r dist/* root@<YOUR_VPS_IP>:/var/www/myclaimindia-frontend/
   ```

---

## 6. Nginx Configuration

Create a unified Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/myclaim-network.conf
```

Paste the following configuration:

```nginx
# ─────────────────────────────────────────────────────────────
# 1. WealthEarth Portal (wealthearth.com)
# ─────────────────────────────────────────────────────────────
server {
    listen 80;
    server_name wealthearth.com www.wealthearth.com;

    root /var/www/wealthearth-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5005/uploads/;
    }
}

# ─────────────────────────────────────────────────────────────
# 2. MyClaim India Portal (myclaimindia.com)
# ─────────────────────────────────────────────────────────────
server {
    listen 80;
    server_name myclaimindia.com www.myclaimindia.com;

    root /var/www/myclaimindia-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5005/uploads/;
    }
}

# ─────────────────────────────────────────────────────────────
# 3. Unified Backend API (api.wealthearth.com)
# ─────────────────────────────────────────────────────────────
server {
    listen 80;
    server_name api.wealthearth.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the configuration and reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/myclaim-network.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Enable SSL with Let's Encrypt (HTTPS)

Run Certbot to automatically configure SSL certificates for all domains:

```bash
sudo certbot --nginx -d wealthearth.com -d www.wealthearth.com -d myclaimindia.com -d www.myclaimindia.com -d api.wealthearth.com
```

Select the option to automatically redirect HTTP traffic to HTTPS.

---

## 8. Role & Login Isolation Verification

- **Visit `https://myclaimindia.com`**:
  - Displays **MyClaim India** branding & styling.
  - Only **Client** accounts can log in using Email or Client ID (`CLI-xxxx`).
  - If a Super Admin, Admin, Partner, or Employee tries to log in here, the backend rejects it with:
    > *"Access Restricted: Administrative and Partner accounts must log in via wealthearth.com."*

- **Visit `https://wealthearth.com`**:
  - Displays **WealthEarth** enterprise branding & styling.
  - Only **Super Admin, Admin, Employee, Super Partner, and Partner** accounts can log in.
  - If a Client tries to log in here, the backend rejects it with:
    > *"Access Restricted: Client accounts must log in via myclaimindia.com."*
