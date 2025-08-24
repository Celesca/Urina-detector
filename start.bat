@echo off
echo 🧪 Starting Urine Detector Application...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if model file exists
if not exist ".\backend\models\40_epochs.pth" (
    echo ⚠️  Model file not found at .\backend\models\40_epochs.pth
    echo    Please ensure the model file is in the correct location.
    pause
    exit /b 1
)

REM Create necessary directories
if not exist ".\backend\models" mkdir ".\backend\models"
if not exist ".\backend\images" mkdir ".\backend\images"

echo 📦 Building and starting containers...

REM Start services
if "%1"=="dev" (
    echo 🔧 Starting in development mode...
    docker-compose -f docker-compose.dev.yml up --build -d
    echo ✅ Development services started!
    echo    Frontend: http://localhost:5173
    echo    Backend:  http://localhost:8000
) else (
    echo 🚀 Starting in production mode...
    docker-compose up --build -d
    echo ✅ Production services started!
    echo    Application: http://localhost:3000
    echo    Backend API: http://localhost:8000
    echo    Full Stack:  http://localhost (with reverse proxy^)
)

echo.
echo 📊 Service Status:
docker-compose ps

echo.
echo 📝 To view logs:
echo    docker-compose logs -f
echo.
echo 🛑 To stop services:
if "%1"=="dev" (
    echo    docker-compose -f docker-compose.dev.yml down
) else (
    echo    docker-compose down
)

pause
