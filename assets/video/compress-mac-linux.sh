#!/usr/bin/env bash
# ===========================================================================
#  Qurious Growth - clip encoder (macOS / Linux)
#
#  1. Install ffmpeg once:   brew install ffmpeg      (macOS)
#                            sudo apt install ffmpeg  (Ubuntu/Debian)
#  2. Either put your clips in a subfolder next to this file called "raw",
#     OR pass any folder path, including a Google Drive folder:
#       bash compress-mac-linux.sh ~/"Google Drive/My Drive/Shorts"
#  3. Run:   bash compress-mac-linux.sh
#
#  Output lands in ./out as short-01.mp4 + short-01.jpg, etc.
#  Copy those into assets/video/ in the website repo.
#  Your originals in raw/ are never modified.
# ===========================================================================
set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install it first:"
  echo "  macOS:  brew install ffmpeg"
  echo "  Linux:  sudo apt install ffmpeg"
  exit 1
fi

SRC="${1:-raw}"

if [ ! -d "$SRC" ]; then
  echo "Folder not found: $SRC"
  echo 'Either create a "raw" folder next to this script, or pass a folder path.'
  exit 1
fi

echo "Reading clips from: $SRC"

mkdir -p out
i=0

shopt -s nullglob nocaseglob
for f in "$SRC"/*.mp4 "$SRC"/*.mov "$SRC"/*.m4v; do
  i=$((i + 1))
  n=$(printf "%02d" "$i")
  echo ""
  echo "[$n] $(basename "$f")"

  ffmpeg -y -loglevel error -stats -i "$f" \
    -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=#08080A,setsar=1" \
    -c:v libx264 -preset slow -crf 26 -profile:v main -pix_fmt yuv420p \
    -movflags +faststart -c:a aac -b:a 96k \
    "out/short-$n.mp4"

  # Poster frame, with a fallback to frame zero for very short clips.
  ffmpeg -y -loglevel error -ss 00:00:01 -i "out/short-$n.mp4" \
    -frames:v 1 -q:v 3 "out/short-$n.jpg" 2>/dev/null || true
  if [ ! -s "out/short-$n.jpg" ]; then
    ffmpeg -y -loglevel error -i "out/short-$n.mp4" -frames:v 1 -q:v 3 "out/short-$n.jpg"
  fi
done

echo ""
echo "Done. $i clips encoded into ./out"
echo "Copy every short-*.mp4 and short-*.jpg into assets/video/ in the repo."
