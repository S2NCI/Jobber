@echo off
cd /d "%~dp0"

::echo Deleting existing database.sqlite...
::del /f /q "database.sqlite"

node db_init.js
node app.js
pause





::admin@example.com	admin123 id3
::user2@example.com	password1 id1
::user3@example.com	password2 id2
::user4@example.com	password3 id2