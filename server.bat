@echo off
cd /d "%~dp0"

::echo Deleting existing database.sqlite...
::del /f /q "database.sqlite"

node db/db_init.js
node app.js
pause



