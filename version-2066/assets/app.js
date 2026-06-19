(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function createCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\" data-card>" +
      "<a class=\"movie-cover\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"movie-year\">" + escapeHtml(item.year) + "</span>" +
      "<span class=\"play-float\">▶</span>" +
      "</a>" +
      "<div class=\"movie-body\">" +
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
      "<p>" + escapeHtml(item.oneLine) + "</p>" +
      "<div class=\"movie-tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initMenu() {
    var toggle = qs("[data-menu-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchForms() {
    qsa("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
        form.setAttribute("action", "search.html");
      });
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initRails() {
    qsa("[data-rail-prev]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-rail-prev"));
        if (target) {
          target.scrollBy({ left: -420, behavior: "smooth" });
        }
      });
    });

    qsa("[data-rail-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.getElementById(button.getAttribute("data-rail-next"));
        if (target) {
          target.scrollBy({ left: 420, behavior: "smooth" });
        }
      });
    });
  }

  function initCategoryFilter() {
    var input = qs("[data-filter-input]");
    var grid = qs("[data-filter-grid]");
    if (!input || !grid) {
      return;
    }
    var cards = qsa("[data-card]", grid);
    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-filter-text") || card.textContent.toLowerCase();
        card.hidden = query && text.indexOf(query) === -1;
      });
    });
  }

  function initSearchPage() {
    var grid = qs("[data-search-grid]");
    if (!grid || !window.MOVIE_INDEX) {
      return;
    }
    var query = getQuery("q").trim();
    var input = qs("[data-search-page-input]");
    var title = qs("[data-search-title]");
    var summary = qs("[data-search-summary]");
    if (input) {
      input.value = query;
    }
    if (!query) {
      if (summary) {
        summary.textContent = "可按关键词浏览匹配影片。";
      }
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.MOVIE_INDEX.filter(function (item) {
      var hay = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        (item.tags || []).join(" "),
        item.oneLine
      ].join(" ").toLowerCase();
      return terms.every(function (term) {
        return hay.indexOf(term) !== -1;
      });
    }).slice(0, 240);

    if (title) {
      title.textContent = "搜索结果：" + query;
    }
    if (summary) {
      summary.textContent = results.length ? "找到 " + results.length + " 部相关影片" : "未找到相关影片";
    }
    grid.innerHTML = results.map(createCard).join("");
  }

  function attachVideo(video, url) {
    if (video.getAttribute("data-ready") === "1") {
      return Promise.resolve();
    }
    video.setAttribute("data-ready", "1");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
      });
    }

    video.src = url;
    return Promise.resolve();
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (player) {
      var video = qs("video", player);
      var button = qs("[data-play-trigger]", player);
      var url = player.getAttribute("data-stream");
      if (!video || !button || !url) {
        return;
      }

      function play() {
        button.classList.add("is-hidden");
        video.controls = true;
        attachVideo(video, url).then(function () {
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {
              button.classList.remove("is-hidden");
            });
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initRails();
    initCategoryFilter();
    initSearchPage();
    initPlayers();
  });
})();
