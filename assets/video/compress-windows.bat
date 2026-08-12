@echo off
REM ===========================================================================
REM  Qurious Growth - clip encoder (Windows)
REM
REM  1. Install ffmpeg once:   winget install Gyan.FFmpeg
REM     Then close and reopen the terminal so it is on your PATH.
REM  2. Either put your clips in a subfolder next to this file called "raw",
REM     OR drag any folder (including a Google Drive for Desktop folder)
REM     straight onto this .bat file.
REM  3. Double-click this file, or drop a folder on it.
REM
REM  Output lands in the "out" folder as short-01.mp4 + short-01.jpg, etc.
REM  Copy those into assets/video/ in the website repo.
REM  Your originals in raw\ are never modified.
REM ===========================================================================

setlocal enabledelayedexpansion

where ffmpeg >nul 2>nul
if errorlevel 1 (
  echo.
  echo ffmpeg was not found. Install it with:  winget install Gyan.FFmpeg
  echo Then close this window, open a new terminal, and run this again.
  echo.
  pause
  exit /b 1
)

set "SRC=%~1"
if "%SRC%"=="" set "SRC=raw"

if not exist "%SRC%" (
  echo.
  echo Folder not found: %SRC%
  echo Either create a "raw" folder next to this file, or drag a folder onto this .bat
  echo.
  pause
  exit /b 1
)

echo Reading clips from: %SRC%

if not exist out mkdir out

set /a i=0
for %%f in ("%SRC%\*.mp4" "%SRC%\*.mov" "%SRC%\*.m4v") do (
  set /a i+=1
  set "n=0!i!"
  set "n=!n:~-2!"
  echo.
  echo [!n!] %%~nxf
  ffmpeg -y -loglevel error -stats -i "%%f" ^
    -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=#08080A,setsar=1" ^
    -c:v libx264 -preset slow -crf 26 -profile:v main -pix_fmt yuv420p ^
    -movflags +faststart -c:a aac -b:a 96k "out\short-!n!.mp4"
  ffmpeg -y -loglevel error -ss 00:00:01 -i "out\short-!n!.mp4" -frames:v 1 -q:v 3 "out\short-!n!.jpg"
  if not exist "out\short-!n!.jpg" ffmpeg -y -loglevel error -i "out\short-!n!.mp4" -frames:v 1 -q:v 3 "out\short-!n!.jpg"
)

echo.
echo Done. !i! clips encoded into the "out" folder.
echo Copy every short-*.mp4 and short-*.jpg into assets/video/ in the repo.
echo.
pause
