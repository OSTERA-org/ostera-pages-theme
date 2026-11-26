// Copyright 2026 OSTERA
//
// Working Group Last Call and Public Review status, for the Working Group
// sites at wg.ostera.org.
//
// 1. Status. Each Last Call or review status on a page is a
//    <span class="review-status"> with data-opens, data-closes, and
//    data-withdrawn dates (yyyy-mm-dd), written by the theme from a work
//    item's registry.yaml. This script compares them with the reader's own
//    date, so a Last Call or review opens and closes on its dates without
//    anyone changing or rebuilding the site. A period includes both dates. Without this script, the page
//    still shows the dates.
//
// 2. Progress. In a progress list (<ol class="stages">), the theme marks the
//    Last Call and Public Review steps with stages__step--review. Each of
//    them is shown as current while one of its Last Calls or reviews is
//    open, as done once one of them has opened, and otherwise as not done
//    yet. The steps are separate: none of them waits for another.
//
// 3. Stage. Each <span class="work-item-stage"> carries the dates of the
//    latest draft of one version of a work item (data-lc-opens,
//    data-rv-closes, and so on), the date the latest draft was approved,
//    if it was, and whether that version is published. The script replaces
//    its text with the current stage (see stageOf), such as "Public Review:
//    Open, comments accepted through 2026-12-26" or "Approved on
//    2027-01-05". A work item with none of these keeps the stage the theme
//    wrote, such as In Development.
//
// 4. All Public Reviews. An element with a data-all-reviews attribute
//    listing Working Group ids, such as data-all-reviews="jss crgm", is
//    filled with every Public Review of those Working Groups, read from
//    each one's /<id>/reviews.json on the same site, in two tables: open
//    and upcoming first, then closed and withdrawn.
//
// If something cannot be read, each element keeps what it holds.
(function () {
  "use strict";

  var d = new Date();
  var today = d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");

  function state(el) {
    if (el.getAttribute("data-withdrawn")) { return "withdrawn"; }
    if (today < el.getAttribute("data-opens")) { return "upcoming"; }
    if (today <= el.getAttribute("data-closes")) { return "open"; }
    return "closed";
  }

  var text = {
    upcoming: function (el) { return "Upcoming, opens " + el.getAttribute("data-opens"); },
    open: function (el) { return "Open, comments accepted through " + el.getAttribute("data-closes"); },
    closed: function (el) { return "Closed on " + el.getAttribute("data-closes"); },
    withdrawn: function (el) { return "Withdrawn on " + el.getAttribute("data-withdrawn"); }
  };

  function isActive(el) {
    var s = state(el);
    return s === "open" || s === "upcoming";
  }

  function showStatus(root) {
    root.querySelectorAll(".review-status").forEach(function (el) {
      var s = state(el);
      el.textContent = text[s](el);
      el.classList.add("review-status--" + s);
    });
  }

  function showProgress(root) {
    root.querySelectorAll(".stages__step--review").forEach(function (step) {
      var spans = Array.prototype.slice.call(step.querySelectorAll(".review-status"));
      if (spans.length === 0) { return; }
      var cls = spans.some(function (el) { return state(el) === "open"; }) ? "current" :
        spans.some(function (el) { return state(el) !== "upcoming"; }) ? "done" : "todo";
      step.classList.remove("stages__step--current", "stages__step--done", "stages__step--todo");
      step.classList.add("stages__step--" + cls);
    });
  }

  // dateSpan makes a detached status element from dates, so the same
  // state and text rules apply.
  function dateSpan(opens, closes, withdrawn) {
    var el = document.createElement("span");
    el.setAttribute("data-opens", opens || "");
    el.setAttribute("data-closes", closes || "");
    el.setAttribute("data-withdrawn", withdrawn || "");
    return el;
  }

  // stageOf describes the current stage of a work item from the data of
  // its work-item-stage element, or returns "" to keep the stage the theme
  // wrote. The Working Group Last Call, the Public Review, and the approval
  // of the latest draft are separate events, in any order. The first that
  // applies is shown: Published, an open Public Review or Last Call, the
  // approval, an upcoming Last Call or Public Review, and then the one that
  // opened last.
  function stageOf(el) {
    var a = function (n) { return el.getAttribute("data-" + n) || ""; };
    if (a("published")) { return "Published, Version " + a("version"); }
    var events = [];
    if (a("rv-opens")) {
      events.push({ label: "Public Review", el: dateSpan(a("rv-opens"), a("rv-closes"), a("rv-withdrawn")) });
    }
    if (a("lc-opens")) {
      events.push({ label: "Working Group Last Call", el: dateSpan(a("lc-opens"), a("lc-closes"), a("lc-withdrawn")) });
    }
    var show = function (e) { return e.label + ": " + text[state(e.el)](e.el); };
    var withState = function (s) { return events.filter(function (e) { return state(e.el) === s; }); };
    var open = withState("open");
    if (open.length) { return show(open[0]); }
    if (a("approved") && a("approved") <= today) { return "Approved on " + a("approved"); }
    var upcoming = withState("upcoming");
    if (upcoming.length) {
      upcoming.sort(function (x, y) { return x.el.getAttribute("data-opens") < y.el.getAttribute("data-opens") ? -1 : 1; });
      return show(upcoming[0]);
    }
    if (!events.length) { return ""; }
    events.sort(function (x, y) { return x.el.getAttribute("data-opens") < y.el.getAttribute("data-opens") ? 1 : -1; });
    return show(events[0]);
  }

  function showStages(root) {
    root.querySelectorAll(".work-item-stage").forEach(function (el) {
      var stage = stageOf(el);
      if (stage) { el.textContent = stage; }
    });
  }

  function cell(row, content) {
    var td = document.createElement("td");
    if (typeof content === "string") {
      td.textContent = content;
    } else {
      td.appendChild(content);
    }
    row.appendChild(td);
    return td;
  }

  function link(href, label) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    return a;
  }

  function reviewsTable(list) {
    var table = document.createElement("table");
    table.className = "review-history";
    table.innerHTML = "<thead><tr><th>Draft</th><th>Work Item</th><th>Working Group</th><th>Period</th><th>Status</th></tr></thead>";
    var body = document.createElement("tbody");
    list.forEach(function (r) {
      var row = document.createElement("tr");
      cell(row, link(r.draft_url || r.file_url, r.draft));
      var item = cell(row, link(r.url, r.name));
      if (r.number) {
        var n = document.createElement("span");
        n.className = "work-item__number";
        n.textContent = r.number;
        item.appendChild(n);
      }
      cell(row, link(r.working_group_url, r.working_group_name));
      cell(row, r.opens + " through " + r.closes);
      var status = dateSpan(r.opens, r.closes, r.withdrawn);
      status.className = "review-status";
      cell(row, status);
      body.appendChild(row);
    });
    table.appendChild(body);
    return table;
  }

  function loadAllReviews() {
    var holders = Array.prototype.slice.call(document.querySelectorAll("[data-all-reviews]"));
    if (holders.length === 0 || !window.fetch) { return; }
    holders.forEach(function (holder) {
      var ids = holder.getAttribute("data-all-reviews").split(/\s+/).filter(Boolean);
      Promise.all(ids.map(function (id) {
        return fetch("/" + id + "/reviews.json")
          .then(function (response) { return response.ok ? response.json() : []; })
          .catch(function () { return []; });
      })).then(function (lists) {
        var all = [].concat.apply([], lists).filter(function (r) { return r.step === "Public Review"; });
        var active = function (r) { return isActive(dateSpan(r.opens, r.closes, r.withdrawn)); };
        var current = all.filter(active);
        var past = all.filter(function (r) { return !active(r); });
        current.sort(function (x, y) { return x.closes < y.closes ? -1 : x.closes > y.closes ? 1 : 0; });
        past.sort(function (x, y) { return x.opens < y.opens ? 1 : x.opens > y.opens ? -1 : 0; });
        holder.textContent = "";
        [["Open and Upcoming", current, "No Public Review is open or upcoming."],
          ["Closed and Withdrawn", past, "None yet."]].forEach(function (part) {
          var h = document.createElement("h2");
          h.textContent = part[0];
          holder.appendChild(h);
          if (part[1].length === 0) {
            var p = document.createElement("p");
            p.textContent = part[2];
            holder.appendChild(p);
          } else {
            holder.appendChild(reviewsTable(part[1]));
          }
        });
        showStatus(holder);
      });
    });
  }

  function run() {
    showStatus(document);
    showProgress(document);
    showStages(document);
    loadAllReviews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}());
