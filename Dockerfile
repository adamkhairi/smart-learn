# Stage 1: Build the PHP-FPM application
FROM php:8.2-fpm-alpine AS laravel_php

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    curl \
    libzip-dev \
    postgresql-dev \
    onboard-keyring \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_pgsql zip pcntl bcmath opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application code
COPY . /var/www/html

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Generate application key and optimize configuration (for production)
RUN php artisan key:generate --force || true
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache
RUN php artisan event:cache

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Stage 2: Setup Nginx and combine with PHP-FPM
FROM alpine:latest

# Install Nginx and Supervisor
RUN apk add --no-cache nginx supervisor

# Copy Nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy Supervisor configuration for PHP-FPM
COPY docker/supervisor/supervisord.conf /etc/supervisord.conf

# Copy PHP-FPM from the previous stage
COPY --from=laravel_php /usr/local/bin/php /usr/local/bin/php
COPY --from=laravel_php /usr/local/sbin/php-fpm /usr/local/sbin/php-fpm
COPY --from=laravel_php /etc/php82 /etc/php82 # Adjust PHP version directory if different

# Copy the application code from the PHP stage
COPY --from=laravel_php /var/www/html /var/www/html

# Set permissions for Nginx and PHP-FPM
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chown -R nginx:nginx /var/www/html/public

# Expose port 80
EXPOSE 80

# Start Supervisor to manage Nginx and PHP-FPM
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
