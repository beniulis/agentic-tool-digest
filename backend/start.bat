@echo off
REM Quick start script for the research backend (Windows)

echo Starting Agentic Tool Research Backend...
echo.

REM Check if .env exists
if not exist ".env" (
    echo Warning: .env file not found
    echo Please copy .env.example to .env and add your OPENAI_API_KEY
    echo.
    pause
)

REM Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate venv
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt --quiet

REM Start server
echo.
echo Backend ready!
echo Starting API server on http://localhost:8000
echo.
echo Press Ctrl+C to stop
echo.

python api.py
