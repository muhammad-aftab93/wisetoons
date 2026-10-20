@echo off
pushd "%~dp0android"
call .\gradlew.bat %*
set EXIT_CODE=%ERRORLEVEL%
popd
exit /b %EXIT_CODE%
