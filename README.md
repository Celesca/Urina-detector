# Urine Detector - Docker Setup

This project uses Docker Compose to run both the frontend and backend services together.

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- At least 4GB of available RAM
- At least 2GB of free disk space

## Quick Start

### Production Deployment

1. **Clone the repository**:
```bash
git clone <repository-url>
cd urina
```

2. **Start all services**:
```bash
docker-compose up -d
```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Full Application (with reverse proxy): http://localhost

4. **Stop all services**:
```bash
docker-compose down
```

### Development Mode

For development with hot reload:

1. **Start development services**:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Access the application**:
   - Frontend (with hot reload): http://localhost:5173
   - Backend API: http://localhost:8000

3. **Stop development services**:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Services

### Backend Service
- **Container**: `urina-backend`
- **Port**: 8000
- **Technology**: FastAPI + Python
- **Model**: PyTorch neural network for urine analysis
- **Health Check**: `http://localhost:8000/health`

### Frontend Service
- **Container**: `urina-frontend`
- **Port**: 3000 (production) / 5173 (development)
- **Technology**: React + TypeScript + Tailwind CSS
- **Build Tool**: Vite

### Reverse Proxy (Optional)
- **Container**: `urina-proxy`
- **Port**: 80
- **Technology**: Nginx
- **Purpose**: Routes frontend and API requests through a single port

## Docker Commands

### Build and Start
```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# Start specific service
docker-compose up backend
```

### Logs and Monitoring
```bash
# View logs from all services
docker-compose logs

# View logs from specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### Managing Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart backend

# Rebuild specific service
docker-compose up --build backend
```

### Clean Up
```bash
# Remove all containers, networks, and images
docker-compose down --rmi all

# Remove unused Docker resources
docker system prune -f
```

## Environment Variables

### Backend (.env)
```env
PORT=8000
HOST=0.0.0.0
DEBUG=False
MODEL_PATH=models/40_epochs.pth
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://frontend:80
```

### Frontend
```env
NODE_ENV=production
VITE_API_URL=http://localhost:8000
```

## Volume Mounts

- `./backend/models:/app/models` - Model files
- `./backend/images:/app/images` - Test images
- `./frontend:/app` - Frontend source (development only)

## Network Configuration

All services run on the `urina-network` bridge network, allowing inter-service communication.

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Make sure ports 80, 3000, 5173, and 8000 are not in use
   - Modify ports in docker-compose.yml if needed

2. **Memory issues**:
   - Ensure Docker has enough memory allocated (4GB recommended)
   - Check Docker Desktop settings

3. **Build failures**:
   - Clear Docker cache: `docker system prune -f`
   - Rebuild from scratch: `docker-compose build --no-cache`

4. **Model file missing**:
   - Ensure `40_epochs.pth` is in the `backend/models/` directory
   - Check file permissions

### Health Checks

All services include health checks:
```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost:8000/health  # Backend
curl http://localhost:3000         # Frontend
```

### Debugging

1. **Access container shell**:
```bash
# Backend container
docker-compose exec backend bash

# Frontend container
docker-compose exec frontend sh
```

2. **View detailed logs**:
```bash
# All services
docker-compose logs --details

# Specific service with timestamps
docker-compose logs -t backend
```

## Development Workflow

1. **Start development environment**:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Make changes** to source code (auto-reload enabled)

3. **View logs** for debugging:
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

4. **Test the application** at http://localhost:5173

5. **Stop when done**:
```bash
docker-compose -f docker-compose.dev.yml down
```

## Production Deployment

For production deployment:

1. **Update environment variables** in `.env` files
2. **Build production images**:
```bash
docker-compose build
```
3. **Start services**:
```bash
docker-compose up -d
```
4. **Monitor with logs**:
```bash
docker-compose logs -f
```

## Security Considerations

- Change default ports in production
- Use environment-specific `.env` files
- Enable HTTPS with SSL certificates
- Implement proper authentication
- Regular security updates for base images

## Performance Optimization

- Use multi-stage builds for smaller images
- Implement proper caching strategies
- Monitor resource usage
- Scale services as needed

## Backup and Restore

```bash
# Backup volumes
docker run --rm -v urina_models_data:/data -v $(pwd):/backup alpine tar czf /backup/models_backup.tar.gz /data

# Restore volumes
docker run --rm -v urina_models_data:/data -v $(pwd):/backup alpine tar xzf /backup/models_backup.tar.gz -C /
```
