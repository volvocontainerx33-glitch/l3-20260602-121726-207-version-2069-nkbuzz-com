(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var rootSelector = form.getAttribute('data-filter-target') || '[data-filter-list]';
    var target = document.querySelector(rootSelector);
    var cards = target ? Array.prototype.slice.call(target.querySelectorAll('.movie-card')) : [];
    var keywordInput = form.querySelector('[name="keyword"]');
    var regionInput = form.querySelector('[name="region"]');
    var typeInput = form.querySelector('[name="type"]');
    var yearInput = form.querySelector('[name="year"]');

    function applyFilter() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var region = regionInput ? regionInput.value : '';
      var type = typeInput ? typeInput.value : '';
      var year = yearInput ? yearInput.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' ').toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesRegion = !region || card.getAttribute('data-region') === region;
        var matchesType = !type || card.getAttribute('data-type') === type;
        var matchesYear = !year || String(card.getAttribute('data-year')) === year;
        var visible = matchesKeyword && matchesRegion && matchesType && matchesYear;

        card.classList.toggle('hidden-by-filter', !visible);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    Array.prototype.slice.call(form.querySelectorAll('input, select')).forEach(function (control) {
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });
  });

  function loadHls(video, source) {
    if (!video || !source) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
    } else {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  var playerCards = Array.prototype.slice.call(document.querySelectorAll('[data-player-card]'));

  playerCards.forEach(function (card) {
    var video = card.querySelector('video[data-src]');
    var button = card.querySelector('[data-play-button]');

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', function () {
      button.classList.add('is-hidden');
      loadHls(video, video.getAttribute('data-src'));
    });
  });
})();
