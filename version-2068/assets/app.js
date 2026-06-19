(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-hero-dot'), 10) || 0;
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function textOf(card) {
    return (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
  }

  function matchesFilter(card, value) {
    if (!value || value === 'all') {
      return true;
    }
    var fields = [
      card.getAttribute('data-category'),
      card.getAttribute('data-type'),
      card.getAttribute('data-region')
    ];
    return fields.some(function (field) {
      return field === value;
    });
  }

  function filterCards(group) {
    var input = group.querySelector('[data-card-search]');
    var active = group.querySelector('[data-filter-value].is-active');
    var grid = group.parentElement.querySelector('[data-card-grid]') || document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }

    var query = input ? input.value.trim().toLowerCase() : '';
    var value = active ? active.getAttribute('data-filter-value') : 'all';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));

    cards.forEach(function (card) {
      var visible = textOf(card).indexOf(query) !== -1 && matchesFilter(card, value);
      card.classList.toggle('is-hidden', !visible);
    });
  }

  function setupFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));
    groups.forEach(function (group) {
      var input = group.querySelector('[data-card-search]');
      var chips = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));

      if (input) {
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q');
        if (keyword && !input.value) {
          input.value = keyword;
        }
        input.addEventListener('input', function () {
          filterCards(group);
        });
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chips.forEach(function (item) {
            item.classList.remove('is-active');
          });
          chip.classList.add('is-active');
          filterCards(group);
        });
      });

      filterCards(group);
    });
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var stream = player.getAttribute('data-stream');
    var prepared = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function playVideo() {
      var task = video.play();
      if (task && typeof task.catch === 'function') {
        task.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    function prepare() {
      if (prepared) {
        playVideo();
        return;
      }

      prepared = true;
      player.classList.add('is-playing');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(stream);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }

      video.src = stream;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      video.load();
    }

    if (overlay) {
      overlay.addEventListener('click', prepare);
    }

    video.addEventListener('click', function () {
      if (!prepared || video.paused) {
        prepare();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
