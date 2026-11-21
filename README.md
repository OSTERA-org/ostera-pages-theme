# OSTERA Pages Theme

This repository holds the shared Jekyll theme for the OSTERA GitHub.io Pages. Any change to this repository will show up on every site the next time that site is built. This theme will enable every GitHub site to have a similar look and feel to that of [ostera.org](https://ostera.org/).

This theme is currently used by:

* https://pub.ostera.org/ (the publications site)
* https://wg.ostera.org/ (the working groups site)
* https://wg.ostera.org/&lt;wg&gt;/ (individual working group sites)
* https://pub.ostera.org/reviews/ (the public reviews, part of the publications site)

## Using the Theme

To use this theme for a website, add the following settings to the `_config.yml` file in the root folder of that site and update them. A working group site gets its complete `_config.yml` from the [wg-template](https://github.com/OSTERA-org-Working-Groups/wg-template/) repository (`06-Website/_config.yml`).

```yaml
# Settings read by the theme.
title: "OSTERA Example Working Group"
short_title: "Example"
description: "One sentence about the site, used by search engines."

remote_theme: OSTERA-org/ostera-pages-theme
plugins:
  - jekyll-remote-theme

# The section marked as current in the OSTERA menu bar:
# "wg" for Working Groups, or "pub" for Publications.
ostera_section: wg

# The site's GitHub repository, ending with "/". When it is set, the theme
# adds a GitHub entry to the site bar menu and a GitHub icon to the footer.
repo_url: https://github.com/OSTERA-org-Working-Groups/example/

# The site bar menu. A url on this site starts with "/" and leaves out the
# site's own path (for example "/jss"), which is added automatically. A full
# url (with "://") is used as written.
navigation:
  - title: Home
    url: /
```

## Layouts

| Layout | Use |
| --- | --- |
| `default` | The OSTERA bar, the site bar, the page content, and the footer |
| `page` | A cream title band with the page title, then the content |
| `home` | A cream hero band with a heading, introduction, and buttons, then the content |

The `page` layout reads an optional `lead` value from front matter. The `home` layout reads `hero_title`, `hero_text`, and `hero_buttons`. See the comment at the top of `_layouts/home.html`.

## Styles

Brand colors and fonts are in `_sass/ostera/_variables.scss`. A site can add its own styles by creating `_sass/ostera-custom.scss` in its own source folder.

The following classes are available inside page content:

| Class | Effect |
| --- | --- |
| `band`, `band--cream`, `band--dark` | Full width sections |
| `button button--primary`, `button button--secondary` | Buttons |
| `card-grid` and `card` | A grid of cards |
| `lead` | Larger introduction text |
| `stages` and `stages__step`, with `stages__step--done`, `stages__step--current`, or `stages__step--todo` | A progress bar of numbered steps, as on the public review pages of pub.ostera.org |
| `review-status` and `review-banner` | The status of a public review, and the status line at the top of a review page |

## Scripts

`assets/js/ostera.js` is loaded on every page. It only acts on pages that contain public review statuses (`<span class="review-status">` with `data-opens`, `data-closes`, and `data-withdrawn` dates), which pubcheck writes on pub.ostera.org. It compares those dates with the reader's own date and shows each review as upcoming, open, closed, or withdrawn, so a review opens and closes on its dates without anyone changing the site. Without the script, the pages still show the dates.

The same script shows the public reviews of a work item on a Working Group site. Put an element with a `data-reviews-for` attribute set to the work item's short name on a page:

```html
<div class="work-item-reviews" data-reviews-for="jcs">
  <p><a href="https://pub.ostera.org/reviews/jcs/">Public reviews of this work item</a></p>
</div>
```

The script reads https://pub.ostera.org/reviews/reviews.json, which pubcheck writes, and replaces the element's contents with a list of that work item's reviews, newest first, each with its live status, and a link to the review history. A new review, or a changed date, appears as soon as pub.ostera.org has it, with no change to the Working Group repository. If the list cannot be read, the element keeps what it holds.

## Images

| File | Use |
| --- | --- |
| `assets/images/ostera-logo.png` | The logo in the OSTERA bar (white text, for a navy background) |
| `assets/images/ostera-swiss.png` | The "OSTERA, a Swiss Association" logo in the footer |
| `assets/images/favicon.png` | The browser tab icon |

## Fonts

ostera.org uses Trajan Pro for headings. These sites use [Cinzel](https://fonts.google.com/specimen/Cinzel) from Google Fonts instead. Body text uses Helvetica Neue, with Arial as the fallback.

## License

See [LICENSE](LICENSE).
