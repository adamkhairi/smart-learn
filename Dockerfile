# Production-ready Dockerfile for Laravel + Inertia (React)
# Single image running Nginx + PHP-FPM using webdevops/php-nginx base.
# Builds assets during image build.

FROM webdevops/php-nginx:8.3-alpine

# Set working directory and document root
ENV WEB_DOCUMENT_ROOT=/var/www/html/public \
    APP_ENV=production
WORKDIR /var/www/html

# System dependencies + PHP extensions
RUN apk add --no-cache \
        bash git unzip icu-dev oniguruma-dev libzip-dev nodejs npm postgresql-dev \
    && docker-php-ext-install \
        pdo pdo_pgsql mbstring zip intl

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy app files
COPY . /var/www/html

# Ensure storage and bootstrap cache are writable
RUN chown -R application:application /var/www/html \
    && mkdir -p storage/framework/{cache,sessions,views} storage/logs \
    && chmod -R ug+rw storage bootstrap/cache

# Switch to non-root user provided by base image
USER application

# Install PHP dependencies
RUN composer install --no-dev --prefer-dist --optimize-autoloader \
    && php artisan config:clear || true \
    && php artisan route:clear || true \
    && php artisan view:clear || true

# Install and build frontend assets
RUN npm ci \
    && npm run build

# Copy Nginx vhost config
USER root
COPY deploy/nginx.conf /opt/docker/etc/nginx/vhost.common.d/laravel.conf

# Expose port (the base image exposes 80 by default)
EXPOSE 80

