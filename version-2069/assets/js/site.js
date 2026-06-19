(function() {
  var currentScript = document.currentScript;
  var scriptBase = currentScript ? currentScript.src.replace(/\/[^\/]*$/, "/") : "";

  function select(selector, root) {
    return (root || document).querySelector(selector);
  }

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = select("[data-mobile-toggle]");
    var nav = select("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function() {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = select("[data-hero]");
    var items = selectAll("[data-hero-item]");
    var thumbs = selectAll("[data-hero-thumb]");

    if (!hero || !items.length) {
      return;
    }

    var active = 0;

    function render(index) {
      var item = items[index];
      if (!item) {
        return;
      }

      active = index;
      hero.style.setProperty("--hero-image", "url('" + item.getAttribute("data-image") + "')");

      select("[data-hero-title]", hero).textContent = item.getAttribute("data-title") || "";
      select("[data-hero-desc]", hero).textContent = item.getAttribute("data-desc") || "";
      select("[data-hero-year]", hero).textContent = item.getAttribute("data-year") || "";
      select("[data-hero-region]", hero).textContent = item.getAttribute("data-region") || "";
      select("[data-hero-type]", hero).textContent = item.getAttribute("data-type") || "";
      select("[data-hero-link]", hero).setAttribute("href", item.getAttribute("data-link") || "#");
      select("[data-hero-category]", hero).setAttribute("href", item.getAttribute("data-category") || "categories.html");

      var poster = select("[data-hero-poster]", hero);
      poster.setAttribute("src", item.getAttribute("data-image") || "");
      poster.setAttribute("alt", item.getAttribute("data-title") || "");

      thumbs.forEach(function(thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    thumbs.forEach(function(thumb, index) {
      thumb.addEventListener("click", function() {
        render(index);
      });
    });

    render(0);

    window.setInterval(function() {
      render((active + 1) % items.length);
    }, 5200);
  }

  function cardMatches(card, keyword, year, category) {
    var text = (card.getAttribute("data-search") || "").toLowerCase();
    var cardYear = card.getAttribute("data-year") || "";
    var cardCategory = card.getAttribute("data-category") || "";

    if (keyword && text.indexOf(keyword) === -1) {
      return false;
    }

    if (year && cardYear !== year) {
      return false;
    }

    if (category && cardCategory !== category) {
      return false;
    }

    return true;
  }

  function setupLocalFilters() {
    var filter = select("[data-filter]");
    var cards = selectAll("[data-movie-card]");
    var empty = select("[data-empty]");

    if (!filter || !cards.length) {
      return;
    }

    var keywordInput = select("[data-filter-keyword]", filter);
    var yearSelect = select("[data-filter-year]", filter);
    var categorySelect = select("[data-filter-category]", filter);

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;

      cards.forEach(function(card) {
        var show = cardMatches(card, keyword, year, category);
        card.style.display = show ? "" : "none";
        visible += show ? 1 : 0;
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [keywordInput, yearSelect, categorySelect].forEach(function(control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function setupSearchPage() {
    var root = select("[data-search-page]");

    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = select("[data-search-page-input]");
    var results = select("[data-search-results]");

    if (input) {
      input.value = query;
    }

    function createResult(movie) {
      var article = document.createElement("article");
      article.className = "movie-card";
      article.setAttribute("data-movie-card", "");
      article.innerHTML = [
        '<a class="movie-cover" href="' + movie.href + '">',
        '<img src="' + movie.cover + '" alt="' + movie.title + '">',
        '<span class="movie-year">' + movie.year + '</span>',
        '</a>',
        '<div class="movie-body">',
        '<h3 class="movie-title"><a href="' + movie.href + '">' + movie.title + '</a></h3>',
        '<p class="movie-line">' + movie.oneLine + '</p>',
        '<div class="movie-tags"><span>' + movie.category + '</span><span>' + movie.type + '</span></div>',
        '</div>'
      ].join("");

      return article;
    }

    function render() {
      if (!results) {
        return;
      }

      var keyword = (input ? input.value : query).trim().toLowerCase();
      results.innerHTML = "";

      if (!keyword) {
        return;
      }

      var found = window.MOVIE_SEARCH_DATA.filter(function(movie) {
        return movie.search.indexOf(keyword) !== -1;
      }).slice(0, 160);

      if (!found.length) {
        results.innerHTML = '<div class="empty" style="display: block;">没有找到匹配内容</div>';
        return;
      }

      found.forEach(function(movie) {
        results.appendChild(createResult(movie));
      });
    }

    if (input) {
      input.addEventListener("input", render);
    }

    render();
  }

  function setupPlayer() {
    selectAll("[data-player]").forEach(function(player) {
      var video = select("video", player);
      var button = select("[data-play-button]", player);

      if (!video) {
        return;
      }

      var hlsSource = video.getAttribute("data-hls");
      var mp4Source = video.getAttribute("data-mp4");
      var hlsAttached = false;

      function attachMp4() {
        if (mp4Source && video.getAttribute("src") !== mp4Source) {
          video.setAttribute("src", mp4Source);
        }
      }

      function attachHls() {
        if (!hlsSource || hlsAttached) {
          return Promise.resolve();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.setAttribute("src", hlsSource);
          hlsAttached = true;
          return Promise.resolve();
        }

        if (window.location.protocol === "file:") {
          attachMp4();
          return Promise.resolve();
        }

        return import(scriptBase + "hls-vendor.js").then(function(module) {
          var Hls = module.H;

          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false
            });

            hls.loadSource(hlsSource);
            hls.attachMedia(video);
            hlsAttached = true;
          } else {
            attachMp4();
          }
        }).catch(function() {
          attachMp4();
        });
      }

      function playVideo() {
        attachHls().then(function() {
          if (!video.getAttribute("src") && mp4Source) {
            attachMp4();
          }

          video.play().then(function() {
            if (button) {
              button.classList.add("is-hidden");
            }
          }).catch(function() {
            if (button) {
              button.classList.remove("is-hidden");
            }
          });
        });
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function() {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function() {
        if (button) {
          button.classList.add("is-hidden");
        }
      });

      video.addEventListener("pause", function() {
        if (button) {
          button.classList.remove("is-hidden");
        }
      });

      attachHls();
    });
  }

  setupMobileMenu();
  setupHero();
  setupLocalFilters();
  setupSearchPage();
  setupPlayer();
})();
