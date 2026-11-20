# Jeonghwan Lee — personal website

A static HTML/CSS/JavaScript website. `main.py` is an unused PyCharm sample and is not required to run the site.

## Preview locally

From this folder, run:

```bash
python -m http.server 8000
```

Open http://localhost:8000/ in your browser. On Windows in PyCharm, run the same command in the Terminal from the `jhlee-materials` directory.

## Pages

- `index.html`: home
- `about/`, `research/`, `publications/`, `projects/`, `contact/`: section pages
- `css/style.css`: shared light theme and responsive layout
- `js/site.js`: mobile navigation and footer year
- `papers/`: the original seven PDF files

## Content review before publishing

Review affiliation, degree status, project descriptions, publication metadata, paper-sharing rights, and external profile links. The previous CV button was removed because `cv.pdf` was not present. The contact page uses the existing academic email and omits the previously displayed personal phone number and room number.

## Hobby entries and photos

Edit the relevant `entries` list in `activities/hobbies.json`. Each entry has a `title` and can include a `detail` and a short `note`. For Reading and Gym, use `note` for your impressions and an optional numeric `rating` from 0 to 5. Use `detail` for the author of a book or the exercises in a workout. Entries appear in the order listed.

For a guitar piece, add a `recording` URL to show an audio player. For a coding project, use `url` for its demo or project page and `source` for its repository. Visitors can open either link. The copy button shares the project URL or, when only the source is listed, the repository URL. Links can be HTTP(S) URLs or local paths relative to `activities/`.

Cooking and Baking appear together on the page. They each have an `entries` list inside `collections` and their own photo folder. Add photos under `activities/photos/` in `cooking/`, `baking/`, `guitar/`, `walking/` or `plants/`. Descriptive filenames provide the image labels.

Run `node scripts/build-hobby-albums.mjs` from the repository root after updating entries or media. It refreshes the Hobbies section of `activities/index.html`. A hobby becomes expandable when its first entry or photo is available.

## Conference photos

In `activities/index.html`, each attended meeting has a list item with its own ID (for example, `kim-spring-2022`). To add one or two photos, place the files in `activities/photos/conferences/<meeting-id>/` and add a `conference-photos` block after the meeting name inside its `div`. Use one link per photo and describe what it shows in the alt text.

```html
<div class="conference-photos">
  <a href="photos/conferences/kim-spring-2022/photo.jpg">
    <img src="photos/conferences/kim-spring-2022/photo.jpg" alt="Description of the conference photo" loading="lazy">
  </a>
</div>
```
