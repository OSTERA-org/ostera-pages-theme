// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 OSTERA
//
// Public review status, for pub.ostera.org and the Working Group sites.
//
// 1. Status. Each review status on a page is a <span class="review-status">
//    with data-opens, data-closes, and data-withdrawn dates (yyyy-mm-dd),
//    written by pubcheck. This script compares them with the reader's own
//    date, so a review opens and closes on its dates without anyone
//    changing or rebuilding the site. A review period includes both dates.
//    Without this script, the page still shows the dates.
//
// 2. Progress. In a progress list (<ol class="stages">), a Public Review
//    step that is current is shown as done once none of its reviews is
//    open or upcoming, and the next step becomes current.
//
// 3. Working Group pages. An element with a data-reviews-for attribute,
//    such as <div class="work-item-reviews" data-reviews-for="jcs">, is
//    filled with the public reviews of that work item, read from
//    https://pub.ostera.org/reviews/reviews.json, which pubcheck writes.
//    So a Working Group site shows a new review, or a changed date, as soon
//    as pub.ostera.org has it, without any change to the Working Group
//    repository. Whatever the element holds is left in place if the list
//    cannot be read.
(function () {
  "use strict";

  var REVIEWS_URL = "https://pub.ostera.org/reviews/reviews.json";

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

  function showStatus(root) {
    root.querySelectorAll(".review-status").forEach(function (el) {
      var s = state(el);
      el.textContent = text[s](el);
      el.classList.add("review-status--" + s);
    });
  }

  function showProgress(root) {
    root.querySelectorAll(".stages").forEach(function (list) {
      var step = list.querySelector(".stages__step--review.stages__step--current");
      if (!step) { return; }
      var active = Array.prototype.some.call(step.querySelectorAll(".review-status"), function (el) {
        var s = state(el);
        return s === "open" || s === "upcoming";
      });
      var next = step.nextElementSibling;
      if (!active && next) {
        step.classList.replace("stages__step--current", "stages__step--done");
        next.classList.replace("stages__step--todo", "stages__step--current");
      }
    });
  }

  // statusSpan builds the same element pubcheck writes on pub.ostera.org.
  function statusSpan(r) {
    var span = document.createElement("span");
    span.className = "review-status";
    span.setAttribute("data-opens", r.opens);
    span.setAttribute("data-closes", r.closes);
    span.setAttribute("data-withdrawn", r.withdrawn || "");
    span.textContent = "Open from " + r.opens + " through " + r.closes;
    return span;
  }

  function fillReviews(holders, reviews) {
    holders.forEach(function (holder) {
      var id = holder.getAttribute("data-reviews-for");
      var list = reviews.filter(function (r) { return r.shortname === id; });
      list.sort(function (a, b) { return a.opens < b.opens ? 1 : a.opens > b.opens ? -1 : 0; });

      holder.textContent = "";
      if (list.length === 0) {
        var none = document.createElement("p");
        none.textContent = "No public reviews yet.";
        holder.appendChild(none);
        return;
      }
      var ul = document.createElement("ul");
      list.forEach(function (r) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = r.url;
        a.textContent = r.name;
        li.appendChild(a);
        li.appendChild(document.createTextNode(" (version " + r.version + "): "));
        li.appendChild(statusSpan(r));
        ul.appendChild(li);
      });
      holder.appendChild(ul);
      var more = document.createElement("p");
      var history = document.createElement("a");
      history.href = list[0].history_url;
      history.textContent = "Review history and progress";
      more.appendChild(history);
      holder.appendChild(more);
      showStatus(holder);
    });
  }

  function loadReviews() {
    var holders = Array.prototype.slice.call(document.querySelectorAll("[data-reviews-for]"));
    if (holders.length === 0 || !window.fetch) { return; }
    fetch(REVIEWS_URL)
      .then(function (response) {
        if (!response.ok) { throw new Error(response.status); }
        return response.json();
      })
      .then(function (data) { fillReviews(holders, data.reviews || []); })
      .catch(function () { /* keep the fallback text in each holder */ });
  }

  function run() {
    showStatus(document);
    showProgress(document);
    loadReviews();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}());
