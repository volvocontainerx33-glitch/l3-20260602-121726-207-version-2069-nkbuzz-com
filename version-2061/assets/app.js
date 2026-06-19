(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var hero = document.querySelector('#hero');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        play();
      });
    });

    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });

    hero.addEventListener('mouseleave', play);
    play();
  }

  function setupLocalFilters() {
    var input = document.querySelector('.page-search');
    var select = document.querySelector('.page-filter');
    var list = document.querySelector('.searchable-list');
    if (!list || (!input && !select)) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var region = select ? select.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || text.indexOf(region) !== -1;
        card.classList.toggle('is-hidden', !(matchKeyword && matchRegion));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
  }

  function setupGlobalSearch() {
    var input = document.querySelector('#globalSearchInput');
    var button = document.querySelector('#globalSearchButton');
    var results = document.querySelector('#searchResults');
    if (!input || !button || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function render(items) {
      results.innerHTML = items.slice(0, 60).map(function (item) {
        return '' +
          '<article class="movie-card poster-card">' +
            '<a class="poster-link" href="' + item.file + '">' +
              '<img src="' + item.image + '" alt="' + item.title + '" loading="lazy">' +
              '<span class="poster-badge">' + item.type + '</span>' +
            '</a>' +
            '<div class="card-content">' +
              '<div class="card-meta">' + item.region + ' · ' + item.year + ' · ' + item.type + '</div>' +
              '<h3><a href="' + item.file + '">' + item.title + '</a></h3>' +
              '<p>' + item.oneLine + '</p>' +
              '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>' +
            '</div>' +
          '</article>';
      }).join('');
    }

    function search() {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        render(window.SEARCH_MOVIES.slice(0, 36));
        return;
      }
      var terms = query.split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_MOVIES.filter(function (item) {
        var haystack = item.searchText.toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      });
      render(matched);
    }

    button.addEventListener('click', search);
    input.addEventListener('input', search);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        search();
      }
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      input.value = query;
      search();
    }
  }

  function attachVideo(video) {
    var stream = video.getAttribute('data-hls');
    if (!stream || video.dataset.ready === '1') {
      return;
    }
    video.dataset.ready = '1';
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = stream;
  }

  function setupPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
    boxes.forEach(function (box) {
      var video = box.querySelector('.movie-video');
      var button = box.querySelector('.player-start');
      if (!video) {
        return;
      }
      attachVideo(video);

      function start() {
        attachVideo(video);
        box.classList.add('has-started');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupGlobalSearch();
    setupPlayers();
  });
})();
