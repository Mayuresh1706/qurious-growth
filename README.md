# Qurious Growth — website

Static site. No build step, no dependencies, no framework. Push it and it's live.

## Structure

```
.
├── index.html            Home: hero, trust marquees, showreel, services,
│                         stats, results, short-form rail, case studies,
│                         quote, FAQ, booking
├── case-studies.html     Case studies + full screenshot proof wall
├── contact.html          Calendly booking page
├── blog/                 Blog index + one page per post
├── content/              Markdown source for each post
├── robots.txt
├── sitemap.xml
└── assets/
    ├── css/main.css      All styling. Design tokens at the top in :root
    ├── js/main.js        Nav, reveals, count-ups, accordions, rails, lightbox,
    │                     short-form video player
    ├── img/              Result screenshots + favicon
    └── video/            Self-hosted short-form clips (add your MP4s here)
```

## Deploy

1. Push this folder to the GitHub repo root (`qurious-growth`).
2. Vercel auto-deploys on push. No framework preset needed — choose **Other**
   with no build command and the repo root as output.
3. Live in about 30 seconds at quriousgrowth.com.

## Editing

**Design tokens** — top of `assets/css/main.css`, in `:root`. Change
`--brass` and every accent on the site changes with it.

**Copy, services, FAQ, case studies** — edit the HTML directly. Each page is
plain markup with no templating, so search for the text and change it.

**Add a result screenshot**
1. Drop the image in `assets/img/`.
2. Add a `<figure>` inside `.shots` on `index.html` and `case-studies.html`:

```html
<figure class="shot" onclick="lbOpen(this)">
  <img src="/assets/img/your-file.jpg" alt="Description of the metric" loading="lazy">
  <figcaption>LinkedIn · 172,214 impressions in 30 days · +1,047.1% growth</figcaption>
</figure>
```

**Add a short-form clip** — compress it (see `assets/video/README.md`), drop
`short-16.mp4` and `short-16.jpg` into `assets/video/`, then add a card inside
`#shortRail` on `index.html`:

```html
<div class="s-card">
  <div class="s-embed">
    <video src="assets/video/short-16.mp4" poster="assets/video/short-16.jpg"
           muted loop playsinline preload="metadata" aria-label="Short-form clip 16"></video>
    <button class="s-play" onclick="playClip(this)" aria-label="Play clip 16">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
    </button>
    <button class="s-mute" onclick="muteClip(event, this)" aria-label="Toggle sound" hidden>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/></svg>
    </button>
  </div>
</div>
```

## Adding a blog post

Posts are plain HTML, so you can add one without any tooling:

1. Copy `blog/why-every-serious-podcast-needs-a-clipping-network.html` to a new
   file named after the post, using hyphens and no spaces.
2. Change the `<title>`, the meta description, the `.post-meta` line (tag, date,
   read time), the `<h1>`, the `.post-dek`, and the hero image.
3. Replace everything inside `<div class="prose">` with your paragraphs. Use
   `<p>` for text, `<h2>` for sections, `<h3>` for subsections, `<blockquote>`
   for pull quotes and `<hr>` for a divider. Leave the `.post-cta` block alone.
4. Add a `.post-card` block to `blog/index.html`, copying the existing one.
5. Add the new URL to `sitemap.xml`.

Hero images go in `assets/img/blog/`. Resize to about 1600px wide and save as
JPEG at quality 85 before adding, so the page stays fast.

The markdown source of each post is kept in `content/` for reference. It is not
used at runtime; the HTML is what gets served.

## Two things to fix when you can

**Guest logos** are hotlinked from Clearbit, with a Google favicon fallback and
a text wordmark as last resort. It works, but it depends on a third party.
Drop real logo files into `assets/img/logos/` and swap the `src` on each
`.mq-logo img` in `index.html` to make it permanent.

**Short-form clips are self-hosted** and the files are not in this repo yet.
The section will show empty players until you add them. See
`assets/video/README.md` for the exact filenames and the ffmpeg commands to
compress each clip. Add the MP4s before you push.

## Accessibility and performance

- Responsive from 320px up; nav collapses to a full-screen menu below 900px
- `prefers-reduced-motion` disables all animation and scroll smoothing
- Visible keyboard focus rings via `:focus-visible`
- All iframes and images lazy-loaded; total page weight is under 700KB
