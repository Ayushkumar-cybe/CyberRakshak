@echo off
TITLE SIH Backend Launcher

SET "PROJECT_PATH=%~dp0"
SET "VENV_PATH=%PROJECT_PATH%venv"

echo ===================================================
echo  SIH Backend Launcher
echo ===================================================
echo.
echo  [ACTION REQUIRED]
echo  Please ensure your VirtualBox VM (sih-server)
echo  is running BEFORE you continue.
echo.
pause

IF NOT EXIST "%VENV_PATH%\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found at %VENV_PATH%
    pause
    exit /b
)

echo.
echo Starting API Server (Uvicorn) in 5 seconds...
echo (This delay gives the VM's database time to settle.)
echo.
timeout /t 5 /nobreak > nul

echo Launching API Server...
:: We are KEEPING the --loop eventlet fix, as it works!
START "SIH API Server" cmd /k "%VENV_PATH%\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo.
echo Starting Scan Worker (Celery) in 3 seconds...
echo.
timeout /t 3 /nobreak > nul

echo Launching Scan Worker...
::
:: THIS IS THE FIXED LINE
:: We point back to the *original* app and use the 'solo' pool.
::
START "SIH Celery Worker" cmd /k "%VENV_PATH%\Scripts\activate.bat && celery -A app.worker.celery_app worker --loglevel=info -P solo -Q scans"

echo.
echo  All services are launching in new windows.
echo.