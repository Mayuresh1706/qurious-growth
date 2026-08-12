# Short-form clips go here

The site plays these clips directly from your own server. No YouTube, no Drive,
no third party — just MP4 files sitting next to the HTML.

## What to add

15 files, named exactly:

```
short-01.mp4  short-02.mp4  ...  short-15.mp4
short-01.jpg  short-02.jpg  ...  short-15.jpg   ← poster frames
```

The `.jpg` poster is the still frame shown before playback starts. Without it
the card shows a black rectangle until the video loads, so it's worth doing.

Adding fewer than 15? Change `SHORTS_COUNT` in `build.py`, or just delete the
extra `.s-card` blocks from `#shortRail` in `index.html`.

## Fastest route: run the included script

Two scripts sit in this folder and do everything in one go, so the files never
have to leave your machine.

1. Install ffmpeg once.
   Windows: `winget install Gyan.FFmpeg` (then reopen your terminal)
   macOS: `brew install ffmpeg`
2. Point it at your clips, either way:
   - put them in a folder called `raw` next to the script, or
   - use the folder they already live in, including a Google Drive folder
3. Run it.
   Windows: double-click `compress-windows.bat`, or drag the folder of clips
   straight onto the .bat file.
   macOS/Linux: `bash compress-mac-linux.sh` or
   `bash compress-mac-linux.sh ~/"Google Drive/My Drive/Shorts"`

### Running it straight on Google Drive

This works if you have Google Drive for Desktop installed, because Drive then
appears as a normal folder on your machine. Two things to check first:

- Right-click the folder in Explorer or Finder and choose **Available offline**.
  Drive's default streaming mode keeps files in the cloud, so ffmpeg would
  trigger a download on every read, which is slow and can time out.
- The script always writes to a local `out` folder, never back into Drive. That
  is deliberate: writing there would make Drive re-upload every file you just
  made.

Everything lands in an `out` folder as `short-01.mp4` + `short-01.jpg` through
`short-15.*`. Copy those into this folder. Originals are never touched.

Prefer a GUI? HandBrake works too. Use the "Social 9:16 Vertical" preset, set
quality to RF 26, and tick Web Optimized. You will need to rename the files
yourself and grab poster frames some other way.

## What the compression actually does

Straight exports are far too heavy for a website — a 60-second vertical clip
out of Premiere can be 80MB. Compress each one first. Install ffmpeg, then run
this on every clip:

```bash
ffmpeg -i input.mp4 \
  -vf "scale=720:1280:force_original_aspect_ratio=decrease,\
pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=#08080A,setsar=1" \
  -c:v libx264 -preset slow -crf 26 -profile:v main -pix_fmt yuv420p \
  -movflags +faststart \
  -c:a aac -b:a 96k \
  short-01.mp4
```

The `scale` plus `pad` pair is what keeps every clip properly in frame. `scale`
shrinks the video until it fits inside 720x1280 without cropping anything, then
`pad` fills whatever is left over to make the output exactly 720x1280. The pad
colour is the site background, so on a clip that is not a true 9:16 the filler
is invisible against the card. Every file ends up the same shape as the card,
so nothing is ever cropped, squashed, or letterboxed with grey bars.

That lands a 60-second clip at roughly 4–7MB with no visible quality loss at
the size it's displayed. `-movflags +faststart` is the important one — it moves
the index to the front of the file so playback begins before the whole thing
downloads.

Grab the poster frame from two seconds in:

```bash
ffmpeg -i short-01.mp4 -ss 00:00:02 -frames:v 1 -q:v 3 short-01.jpg
```

Batch all of them at once:

```bash
for f in raw/*.mp4; do
  n=$(basename "$f" .mp4)
  ffmpeg -i "$f" -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:color=#08080A,setsar=1" \
    -c:v libx264 -preset slow -crf 26 -profile:v main -pix_fmt yuv420p \
    -movflags +faststart -c:a aac -b:a 96k "$n.mp4"
  ffmpeg -i "$n.mp4" -ss 00:00:02 -frames:v 1 -q:v 3 "$n.jpg"
done
```

## Size limits worth knowing

- GitHub rejects any single file over 100MB, and warns above 50MB. Compressed
  clips are nowhere near this.
- 15 clips at ~6MB each is about 90MB total in the repo. That's fine, though
  every `git clone` carries it.
- Vercel's free tier includes 100GB of bandwidth per month. At 6MB a clip, that
  covers roughly 16,000 clip views. Videos only load when played (`preload="metadata"`
  fetches a few KB), so a normal visitor costs you almost nothing.

## If the repo gets too heavy later

Move the files to object storage and change the `src` on each `<video>` to the
public URL. Cloudflare R2 is the cheapest sensible option — no egress fees at
all. Vercel Blob and Bunny.net Stream also work, and Bunny gives you a real
video CDN with adaptive bitrate for a few dollars a month. Nothing in the markup
changes except the path.
