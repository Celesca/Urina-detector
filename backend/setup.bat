@echo off
echo Setting up Urine Analysis FastAPI Backend...

:: Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

echo Setup complete!
echo.
echo To start the API server, run:
echo uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
echo Then access the API documentation at: http://localhost:8000/docs
