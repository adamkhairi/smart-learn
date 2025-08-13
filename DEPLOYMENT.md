# Deployment Guide (Free Tier)

This project (Laravel 12 + InertiaJS + React) is set up to deploy on Koyeb’s free tier using the included `Dockerfile` and Nginx config.

Koyeb detects the Dockerfile automatically. Inertia assets are built during the Docker image build and served from Laravel’s `public/` directory.

## What’s already in the repo

- `Dockerfile`: Production image using `webdevops/php-nginx:8.3-alpine` (PHP‑FPM + Nginx).
- `deploy/nginx.conf`: Nginx vhost snippet to route all requests to `public/index.php`, cache static assets, and serve the built React bundle.

No separate frontend host is needed. Inertia renders React components while Laravel serves the app.

---

### Optional: Use a single DATABASE_URL instead of individual DB_* vars

Neon provides a full connection URL. You can set this one variable and omit the individual DB_* entries.

```
DATABASE_URL=postgres://<user>:<password>@<neon-host>:5432/<database>?sslmode=require
```

Laravel will parse `DATABASE_URL` automatically when using `pgsql`.

---

## Step 1: Prepare free database and optional Redis

- Postgres (free): Neon (https://neon.tech) — create a project and database. Copy the connection parameters.
- Optional Redis (free): Upstash (https://upstash.com) — create a Redis database and obtain the `REDIS_URL`.

> If you don’t use queues/sessions in Redis, you can skip Upstash and keep `QUEUE_CONNECTION=sync` and `CACHE_DRIVER=file`.

---

## Step 2: Create a Koyeb App & Service

1. Push the repo to GitHub.
2. Go to https://www.koyeb.com → Create App → Create a Service from your GitHub repo.
3. Koyeb will detect the `Dockerfile`. Select the free instance type.
4. Service settings:
   - Service type: Web
   - Exposed port: 80 (autodetected by Docker image)
   - Health check path: /
   - Scale: 1 instance (Free)
5. In Environment Variables, set:

```
APP_KEY=base64:...            # Generate locally: php artisan key:generate --show
APP_ENV=production
APP_DEBUG=false
APP_URL=https://<your-app>.koyeb.app

# Database (Neon Postgres)
DB_CONNECTION=pgsql
DB_HOST=<neon-host>
DB_PORT=5432
DB_DATABASE=<database>
DB_USERNAME=<user>
DB_PASSWORD=<password>
DB_SSLMODE=require

# Cache/Queue/Session (adjust if using Upstash Redis)
CACHE_DRIVER=file             # or redis
QUEUE_CONNECTION=sync         # or redis
SESSION_DRIVER=cookie         # or redis

# If using Upstash Redis
REDIS_URL=rediss://:<pass>@<host>:<port>
```

> Tip: If you use `REDIS_URL`, ensure your Redis client configuration reads it, or set `REDIS_HOST/PORT/PASSWORD` variables instead.

---

## Step 3: First-time one-off tasks

Open the Koyeb service shell (Apps → your app → Services → your service → Deployments → Exec) and run:

```
php artisan migrate --force
php artisan storage:link
```

Optional caches for better performance:

```
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> The Dockerfile already clears caches during build; the above commands are safe in production.

---

## Step 4: (Optional) Queues and Scheduler

- Queues: create a second Koyeb Service for the same repo using the same `Dockerfile`, override the command to run the worker:

```
php artisan queue:work --sleep=1 --tries=3
```

- Scheduler (Cron): create a Koyeb Scheduled Job to run every minute:

```
php artisan schedule:run
```

> If you are not using queued jobs or scheduled tasks yet, you can skip this.

---

## How the Dockerfile works

- Installs PHP extensions (pdo_pgsql, mbstring, zip, intl) and Node/NPM.
- Installs Composer dependencies with optimizations (`--no-dev --optimize-autoloader`).
- Builds the React/Inertia assets (`npm ci && npm run build`).
- Runs Nginx + PHP‑FPM via the base image (supervisord). The document root is `public/`.

---

## Troubleshooting

- 404s on routes: ensure APP_URL is set correctly and that Nginx is using `public/` root (handled by `deploy/nginx.conf`).
- 500 on DB: check DB_* variables and that Neon allows external connections (use the correct connection string).
- Mixed content on HTTPS: set `APP_URL` to `https://…` and clear caches: `php artisan config:clear`.
- Asset issues: confirm the build ran during deploy (Koyeb uses the Dockerfile). Check that `public/build` exists in the container.

If you see composer/npm failing during build, ensure your repo has:
- `Dockerfile` in the root
- `package.json`, `package-lock.json` (or `pnpm-lock.yaml`), and `composer.json`
- Node 20+ is available in image (this Dockerfile installs Node from Alpine repos)

---

## Ready-to-copy .env template (Koyeb)

```
APP_NAME=SmartLearn
APP_ENV=production
APP_KEY=base64:paste_your_key_here
APP_DEBUG=false
APP_URL=https://<your-app>.koyeb.app

LOG_CHANNEL=stack
LOG_LEVEL=info

DB_CONNECTION=pgsql
DB_HOST=<neon-host>
DB_PORT=5432
DB_DATABASE=<database>
DB_USERNAME=<user>
DB_PASSWORD=<password>
DB_SSLMODE=require

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=cookie

# If using Upstash Redis
# REDIS_URL=rediss://:<pass>@<host>:<port>

# Mail (optional)
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.example.com
# MAIL_PORT=587
# MAIL_USERNAME=null
# MAIL_PASSWORD=null
# MAIL_ENCRYPTION=tls
# MAIL_FROM_ADDRESS="noreply@example.com"
# MAIL_FROM_NAME="${APP_NAME}"
```

---

## Quick Checklist

- [ ] GitHub repo is connected to Koyeb.
- [ ] `.env` values configured in Koyeb dashboard.
- [ ] Neon Postgres database created and credentials set in env.
- [ ] (Optional) Upstash Redis URL set if using Redis.
- [ ] Ran `php artisan migrate --force` and `php artisan storage:link` once.
- [ ] Site loads at `https://<your-app>.koyeb.app`.

---

## Alternative: Other Hosts

- Fly.io: good performance and global deployment; requires Docker and has trial credits rather than a perpetual free tier.
- Railway: has free hours/credits that may be limited; setup is similar using the same Dockerfile.
