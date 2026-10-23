@echo off
REM Creates server\.env for the Peer Feedback app.
REM Double-click this file, paste your Atlas password for user Feedback2026, press Enter.

cd /d "%~dp0"
echo.
echo  Peer Feedback - environment setup
echo  ---------------------------------
set /p PW=Paste the Feedback2026 password from MongoDB Atlas, then press Enter:

if "%PW%"=="" (
  echo No password entered. Nothing was changed.
  pause
  exit /b 1
)

REM Generate a random 48-character JWT secret
for /f %%i in ('powershell -NoProfile -Command "-join ((48..57)+(65..90)+(97..122) | Get-Random -Count 48 | %% {[char]$_})"') do set SECRET=%%i

(
echo MONGO_URI=mongodb+srv://Feedback2026:%PW%@cluster0.nlzpmow.mongodb.net/peer-feedback?retryWrites=true^&w=majority^&appName=Cluster0
echo JWT_SECRET=%SECRET%
echo PORT=5000
echo CLIENT_URL=http://localhost:5173
) > server\.env

echo.
echo  Done! Created server\.env
echo  Next: open a terminal in the "server" folder and run:  npm install  then  npm run seed
echo.
pause
