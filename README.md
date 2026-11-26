# OSTERA Pages Theme

This repository holds the shared Jekyll theme for the OSTERA sites on GitHub Pages. It gives each of them the look and feel of [OSTERA.org](https://ostera.org/). Any change to this repository will show up on every site the next time that site is built.

This theme is currently used by:

```
https://pub.ostera.org/     (the publications site)
https://wg.ostera.org/      (the Working Groups site)
https://wg.ostera.org/<wg>/ (individual Working Group sites)
```

## Using the Theme

To use this theme, add these settings to the `_config.yml` file in the root folder of the website:

```yaml
remote_theme: OSTERA-org/ostera-pages-theme
plugins:
  - jekyll-remote-theme
```

The theme also reads these optional settings from `_config.yml`:

| Setting | Use |
| --- | --- |
| `title` | The site's name, used in the browser tab and as the default home page heading |
| `short_title` | The name shown in the site bar (defaults to `title`) |
| `description` | The default description of every page, for search engines (a page can set its own `description`) |
| `lang` | The language of the pages (defaults to `en`) |
| `ostera_section` | `wg` or `pub`, to mark Working Groups or Publications as the current section in the OSTERA bar |
| `navigation` | The links in the site bar, as a list of items with `title` and `url` |
| `repo_url` | The site's GitHub repository, with a trailing slash. It adds a GitHub link to the site bar and the footer, and the work item pages use it for their folder and issue links |

A Working Group site gets a complete copy of `_config.yml` from the [wg-template](https://github.com/OSTERA-org-Working-Groups/wg-template/) repository, in `06-Website/_config.yml`.

## Layouts

| Layout | Use |
| --- | --- |
| `default` | The OSTERA bar, the site bar, the page content, and the footer |
| `page` | A cream title band with the page title, then the content |
| `home` | A cream hero band with a heading, introduction, and buttons, then the content |
| `work-item` | The address of one work item on a Working Group site, which opens the page of its latest draft (or, before any draft, a short page) |
| `work-item-draft` | The page of one draft of a work item, which is the work item's page, built from its `registry.yaml` |

The `page` layout reads an optional `lead` value from front matter. The `home` layout reads `hero_title`, `hero_text`, and `hero_buttons`. See the comment at the top of `_layouts/home.html`.

The `work-item-draft` layout reads `work_item` (the work item's short name), `version`, and `draft` from front matter, and shows everything about one version from `site.data.work_items[work_item]`: its stage, the summary, square selectors for the drafts of that version, the draft's details and formats (PDF, DOCX, and so on, each with its SHA-512 sum), its citation, the version's Progress and Review History (one row for each Working Group Last Call and Public Review), the draft's changes, and its files. Another version is chosen on the Work Items page, which has a row for each version. The `work-item` layout, at the work item's own address, opens the page of the latest draft of the newest version. A Working Group site's build step (`.github/scripts/work-items.pl` in the wg-template repository) checks each registry and writes those pages and data from each `03-Work-Items/<id>/registry.yaml`.

## Includes

These includes go with the layouts above, and some can be used on other pages too:

| Include | Use |
| --- | --- |
| `work-item-stage.html item=w version=v` | The current stage of one version of a work item (the newest without `version`), worked out by the script from its dates |
| `work-item-stages.html version=v id=id` | The progress bar of one version of a work item: Planned, In Development, Last Call, Public Review, Approved, and Published, each done or not on its own |
| `review-history.html version=v id=id` | The Review History table of one version, one row for each Working Group Last Call and Public Review |
| `review-status.html p=draft.last_call` | The status of one Last Call or Public Review |
| `draft-switcher.html version=v id=id current=draft` | The square selectors for the drafts of one version, with the current draft filled in |
| `draft-files.html d=draft v=version id=id` | The formats of one draft, as small links that show each file's SHA-512 sum |
| `cover-fields.html d=draft` | The fields from a draft's cover page: Authors, Editors, Supplement To, Updates, Obsoletes, and Keywords |
| `how-to-comment.html name=draft_name` | How to comment on a draft during its Public Review |
| `type-name.html code="TS"` | The name of a document type code |
| `github-icon.html` | The GitHub mark, used in the footer and beside links to folders on GitHub |
| `work-items-page.html` | The body of a Working Group's Work Items page, in its `06-Website/work-items.md` |
| `meetings-page.html` | The body of a Working Group's Meetings page, in its `06-Website/meetings.md` |
| `publications-page.html` | The body of a Working Group's Publications page, in its `06-Website/publications.md` |
| `reviews-json.html` | Every Public Review of a Working Group, as JSON, in its `06-Website/reviews.json` |

## Styles

Brand colors and fonts are in `_sass/ostera/_variables.scss`. A site can add its own styles by creating `_sass/ostera-custom.scss` in its own source folder.

The following classes are available inside page content:

| Class | Effect |
| --- | --- |
| `band`, `band--cream`, `band--dark` | Full width sections |
| `button button--primary`, `button button--secondary` | Buttons |
| `card-grid` and `card` | A grid of cards |
| `lead` | Larger introduction text |
| `stages` and `stages__step`, with `stages__step--done`, `stages__step--current`, or `stages__step--todo` | A progress bar of numbered steps, each done, current, or not done yet on its own. The script marks the Last Call and Public Review steps (`stages__step--review`) from their dates |
| `review-status` and `review-banner` | The status of a Last Call or Public Review, and the status line at the top of a draft's page |
| `review-history` and `review-history__note` | The Review History table of a version, and the small notes in it |
| `draft-switcher`, `draft-switcher__label`, and `draft-switcher__draft` (with `draft-switcher__draft--current`) | The square selectors for the drafts of one version |
| `draft-files` and `draft-files__format` | The format links of a draft, such as PDF and DOCX |
| `work-item__number`, `work-item-stage`, and `work-items__github` | The number under a work item's name, its stage, and its GitHub cell on a Working Group's Work Items page |
| `github-link` and `github-icon` | A GitHub mark linking to a folder on GitHub |

## Scripts

`assets/js/ostera.js` is loaded on every page, and only acts on the Working Group sites. It compares the dates of each Last Call or Public Review status (`<span class="review-status">` with `data-opens`, `data-closes`, and `data-withdrawn` dates) with the reader's own date, and shows it as upcoming, open, closed, or withdrawn, so it opens and closes on its dates without anyone changing or rebuilding the site. Without the script, the pages still show the dates. It also:

* marks each Last Call and Public Review step of a progress bar (`stages__step--review`) as current while one of its Last Calls or Public Reviews is open, as done once one has opened, and otherwise as not done yet
* replaces the text of each `work-item-stage` with the current stage, worked out from its data attributes: an open Last Call or Public Review, such as `Public Review: Open, comments accepted through 2026-12-26`, or else the approval of the latest draft, such as `Approved on 2027-01-05`, or else an upcoming Last Call or Public Review, or else the one that opened last
* fills an element with `data-all-reviews="jss crgm"` with every Public Review of those Working Groups, read from each one's `/<id>/reviews.json` on the same site, as on https://wg.ostera.org/reviews/

If something cannot be read, each element keeps what it holds.

## Images

| File | Use |
| --- | --- |
| `assets/images/ostera-logo.png` | The logo in the OSTERA bar (white text, for a navy background) |
| `assets/images/ostera-swiss.png` | The "OSTERA, a Swiss Association" logo in the footer |
| `assets/images/favicon.png` | The browser tab icon |

## Fonts

ostera.org uses Trajan Pro for headings. These sites use [Cinzel](https://fonts.google.com/specimen/Cinzel) from Google Fonts instead. Body text uses Helvetica Neue, with Arial as the fallback.

## License

See [LICENSE.md](LICENSE.md).
