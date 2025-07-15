FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \\
    build-base \\
    curl \\
    libzip-dev \\
    postgresql-dev \\
    onboard-keyring \\
    nginx \\
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

# Expose port for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
