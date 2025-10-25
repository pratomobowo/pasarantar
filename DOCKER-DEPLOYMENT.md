# Docker Deployment Guide for PasarAntar BHVR Stack

This guide will help you deploy the PasarAntar application using Docker and Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- At least 2GB of available RAM
- At least 5GB of free disk space

## Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd pasarantar-bhvr
   ```

2. **Build and start the containers**:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api
   - Admin Panel: http://localhost:3000/admin

## Configuration

### Environment Variables

The application uses a dedicated `.docker.env` file for Docker-specific configuration. The default configuration includes:

- **Database**: MySQL 8.0 with persistent storage
- **Application**: Runs on port 3000
- **Environment**: Production mode

### Database Configuration

The database is automatically initialized with:
- Default admin user: `admin` / `admin123`
- Sample categories, units, and products
- Required tables and indexes

### Custom Configuration

To customize the deployment:

1. **Edit the `.docker.env` file**:
   ```bash
   nano .docker.env
   ```

2. **Update the following values**:
   - `MYSQL_ROOT_PASSWORD`: Change the default database password
   - `JWT_SECRET`: Set a secure JWT secret
   - `SMTP_*`: Configure email settings
   - Other environment variables as needed

3. **Restart the containers**:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## Common Issues and Solutions

### 1. Database Connection Errors

**Problem**: Application cannot connect to the database
**Solution**: Ensure the database container is healthy:
```bash
docker-compose ps
docker-compose logs db
```

### 2. Port Conflicts

**Problem**: Port 3000 is already in use
**Solution**: Change the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Use port 8080 instead
```

### 3. Build Failures

**Problem**: Build fails with dependency errors
**Solution**: Clean and rebuild:
```bash
docker-compose down
docker system prune -f
docker-compose up --build
```

### 4. Permission Issues with Uploads

**Problem**: Cannot upload files
**Solution**: Fix permissions on the uploads directory:
```bash
sudo chown -R 1000:1000 ./server/uploads
sudo chmod -R 755 ./server/uploads
```

## Development with Docker

For development, you can use Docker with hot-reload:

1. **Use development compose file**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

2. **Or mount source directories**:
   ```yaml
   volumes:
     - ./server/src:/app/server/src
     - ./client/src:/app/client/src
   ```

## Production Deployment

For production deployment:

1. **Use production environment variables**:
   ```bash
   cp .docker.env .docker.env.prod
   # Edit .docker.env.prod with production values
   ```

2. **Use production compose file**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Set up reverse proxy** (nginx, traefik, etc.) for SSL termination

## Monitoring and Logs

### View Logs
```bash
# View all logs
docker-compose logs

# View application logs
docker-compose logs app

# View database logs
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f app
```

### Monitor Container Status
```bash
docker-compose ps
docker stats
```

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec db mysqldump -u root -p pasarantar > backup.sql

# Restore backup
docker-compose exec -T db mysql -u root -p pasarantar < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v pasarantar-bhvr_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db-data.tar.gz -C /data .
```

## Scaling

### Horizontal Scaling
```yaml
# In docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### Resource Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Security Considerations

1. **Change default passwords** in `.docker.env`
2. **Use secrets management** for production
3. **Enable HTTPS** with reverse proxy
4. **Regularly update** base images
5. **Limit container privileges**:
   ```yaml
   security_opt:
     - no-new-privileges:true
   ```

## Troubleshooting

### Container Won't Start
```bash
# Check container logs
docker-compose logs app

# Check container status
docker-compose ps

# Inspect container
docker inspect pasarantar-bhvr_app_1
```

### Database Issues
```bash
# Connect to database
docker-compose exec db mysql -u root -p

# Check tables
mysql> SHOW TABLES;
mysql> DESCRIBE admins;
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check disk usage
docker system df
```

## Cleanup

### Remove All Containers and Volumes
```bash
docker-compose down -v
docker system prune -a
```

### Remove Only Application Containers
```bash
docker-compose down
# Keep database volume with: -v flag
```

## Support

For issues related to:
- **Docker**: Check Docker documentation
- **Application**: Check application logs
- **Database**: Check MySQL documentation

Remember to always check the logs first when troubleshooting issues!