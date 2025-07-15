FROM nginx:alpine

# Copy custom Nginx configuration
COPY ./docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy application code (only public assets needed for Nginx)
COPY . /var/www/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
