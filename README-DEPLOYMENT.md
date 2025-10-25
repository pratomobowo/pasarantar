# PasarAntar BHVR Deployment Guide

This guide explains how to deploy the PasarAntar BHVR application to a VPS using Docker Compose with single-origin deployment.

## Prerequisites

- Docker and Docker Compose installed on your VPS
- Git installed on your VPS
- Domain name (optional, but recommended)

## Quick Deployment

### 1. Clone the Repository

```bash
git clone <your-repository-url> pasarantar-bhvr
cd pasarantar-bhvr
```

### 2. Configure Environment

```bash
# Copy the production environment template
cp .env.production .env.local

# Edit the environment file with your production settings
nano .env.local
```

**Important: Update these values in `.env.local`:**
- `MYSQL_ROOT_PASSWORD`: Set a secure password for MySQL
- `JWT_SECRET`: Set a secure JWT secret
- `SMTP_USER` and `SMTP_PASS`: Configure your email settings
- Any other production-specific settings

### 3. Deploy the Application

```bash
# Make the deployment script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

The application will be available at `http://your-vps-ip:3000`

## Manual Deployment Steps

If you prefer to deploy manually without the script:

### 1. Build and Start Containers

```bash
# Load environment variables
export $(cat .env.local | grep -v '^#' | xargs)

# Build and start containers
docker-compose up --build -d
```

### 2. Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f app
```

## Environment Variables

### Database Configuration
- `MYSQL_ROOT_PASSWORD`: MySQL root password
- `MYSQL_DATABASE`: Database name (default: pasarantar)

### Application Configuration
- `PORT`: Application port (default: 3000)
- `JWT_SECRET`: Secret key for JWT tokens
- `CLIENT_URL`: URL for CORS (should match your domain)

### Email Configuration
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `EMAIL_FROM`: From email address

## Docker Services

### Application Service
- **Image**: Built from Dockerfile
- **Port**: 3000:3000
- **Environment**: Production variables
- **Volumes**: Uploads directory mounted

### Database Service
- **Image**: MySQL 8.0
- **Port**: 3306:3306
- **Volume**: Persistent data storage
- **Environment**: MySQL configuration

## Useful Commands

### Container Management
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes database data)
docker-compose down -v

# Rebuild and restart
docker-compose up --build -d

# View logs
docker-compose logs -f app
docker-compose logs -f db
```

### Database Management
```bash
# Connect to MySQL container
docker-compose exec db mysql -u root -p

# Backup database
docker-compose exec db mysqldump -u root -p pasarantar > backup.sql

# Restore database
docker-compose exec -i db mysql -u root -p pasarantar < backup.sql
```

### Application Management
```bash
# Access application container
docker-compose exec app sh

# Run commands in application container
docker-compose exec app bun run build:single
```

## SSL/HTTPS Setup (Optional)

For production, you should add SSL. Here are two approaches:

### Option 1: Use Nginx as Reverse Proxy (Recommended)

Create a `docker-compose.prod.yml` with Nginx configuration.

### Option 2: Use Cloudflare

1. Point your domain to your VPS IP
2. Use Cloudflare's free SSL certificate
3. Configure Cloudflare to proxy traffic to port 3000

## Troubleshooting

### Application Won't Start
```bash
# Check logs for errors
docker-compose logs app

# Verify environment variables
docker-compose config
```

### Database Connection Issues
```bash
# Check if database is running
docker-compose ps db

# Test database connection
docker-compose exec app bun -e "console.log('Testing DB connection...')"
```

### Build Failures
```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Port Conflicts
If port 3000 is already in use, modify the `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Use port 8080 instead
```

## Monitoring

### Health Checks
Add health checks to your `docker-compose.yml`:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/hello"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Log Management
Consider using a log management solution for production:
- ELK Stack
- Docker log drivers
- Cloud logging services

## Backup Strategy

### Database Backups
Create a cron job for regular backups:
```bash
# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

### Application Backups
- Git repository for code
- Volume backups for uploads
- Environment variable backups

## Security Considerations

1. **Change Default Passwords**: Always change default passwords
2. **Use Environment Variables**: Never hardcode secrets
3. **Regular Updates**: Keep Docker images updated
4. **Firewall**: Configure firewall rules
5. **SSL**: Use HTTPS in production
6. **Database Security**: Limit database access

## Scaling

### Horizontal Scaling
For higher traffic, consider:
- Load balancer
- Multiple application containers
- Database replication

### Vertical Scaling
- Increase VPS resources
- Optimize database queries
- Use caching (Redis)

## Support

For issues related to:
- **Application**: Check application logs
- **Database**: Check MySQL logs
- **Docker**: Check Docker logs
- **Deployment**: Review this guide and scripts