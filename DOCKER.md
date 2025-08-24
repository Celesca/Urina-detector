# Docker Setup Instructions

## Prerequisites

1. **Install Docker Desktop**:
   - Download from: https://docs.docker.com/desktop/install/windows-install/
   - Start Docker Desktop
   - Ensure Docker is running (you should see the Docker icon in the system tray)

2. **Verify Docker Installation**:
   ```bash
   docker --version
   docker-compose --version
   ```

## Quick Start

### Option 1: Using the Startup Script (Recommended)

**Windows:**
```bash
start.bat
```

**For development mode:**
```bash
start.bat dev
```

### Option 2: Manual Docker Commands

1. **Start Production Environment:**
   ```bash
   docker-compose up --build -d
   ```

2. **Start Development Environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build -d
   ```

3. **View Logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop Services:**
   ```bash
   docker-compose down
   ```

## Access Points

### Production Mode
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Full Application (with proxy)**: http://localhost

### Development Mode
- **Frontend (with hot reload)**: http://localhost:5173
- **Backend API**: http://localhost:8000

## Troubleshooting

### Common Issues

1. **Docker Desktop not running**:
   - Start Docker Desktop application
   - Wait for it to fully start (whale icon should be steady, not animated)

2. **Port conflicts**:
   - Make sure no other applications are using ports 80, 3000, 5173, or 8000
   - Close any running servers (like `npm run dev` or `python main.py`)

3. **Model file missing**:
   - Ensure `40_epochs.pth` is in the `backend/models/` directory
   - If missing, copy it from your training output

4. **Build failures**:
   ```bash
   # Clean Docker cache
   docker system prune -f
   
   # Rebuild from scratch
   docker-compose build --no-cache
   ```

### Health Checks

Check if services are running:
```bash
# View running containers
docker-compose ps

# Check logs
docker-compose logs backend
docker-compose logs frontend

# Test API directly
curl http://localhost:8000/health
```

## Development Workflow

1. **Start development environment**:
   ```bash
   start.bat dev
   ```

2. **Make changes** to source code
   - Frontend changes auto-reload at http://localhost:5173
   - Backend changes require container restart

3. **Restart specific service** after backend changes:
   ```bash
   docker-compose -f docker-compose.dev.yml restart backend
   ```

4. **Stop when done**:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   ```

## File Structure

```
urina/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── start.bat                   # Windows startup script
├── README.md                   # This file
├── backend/
│   ├── Dockerfile             # Backend container config
│   ├── .dockerignore          # Backend ignore file
│   ├── .env                   # Backend environment variables
│   ├── main.py                # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── models/
│       └── 40_epochs.pth      # ML model (required)
├── frontend/
│   ├── Dockerfile             # Frontend production container
│   ├── Dockerfile.dev         # Frontend development container
│   ├── .dockerignore          # Frontend ignore file
│   ├── nginx.conf             # Nginx configuration
│   └── [React app files]
└── nginx/
    └── nginx.conf             # Reverse proxy configuration
```

## Next Steps

1. **Ensure Docker Desktop is running**
2. **Place your model file** in `backend/models/40_epochs.pth`
3. **Run the startup script**: `start.bat`
4. **Access the application** at http://localhost:3000

For any issues, check the logs with `docker-compose logs -f` and refer to the troubleshooting section above.
