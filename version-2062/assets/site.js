(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero-carousel]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-card'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  var homeSearch = document.querySelector('[data-home-search]');

  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector('input');
      var query = input ? input.value.trim() : '';
      window.location.href = 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
    });
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  var grid = document.querySelector('[data-filter-grid]');

  if (filterPanel && grid) {
    var input = filterPanel.querySelector('[data-filter-keyword]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var regionSelect = filterPanel.querySelector('[data-filter-region]');
    var resetButton = filterPanel.querySelector('[data-filter-reset]');
    var resultText = filterPanel.querySelector('[data-filter-result]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-title]'));
    var searchParams = new URLSearchParams(window.location.search);
    var initialQuery = searchParams.get('q');

    if (initialQuery && input) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function matchCard(card, keyword, typeValue, regionValue) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();

      var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      var typeMatched = !typeValue || card.getAttribute('data-type') === typeValue;
      var regionMatched = !regionValue || card.getAttribute('data-region') === regionValue;

      return keywordMatched && typeMatched && regionMatched;
    }

    function applyFilter() {
      var keyword = normalize(input && input.value ? input.value.trim() : '');
      var typeValue = typeSelect && typeSelect.value ? typeSelect.value : '';
      var regionValue = regionSelect && regionSelect.value ? regionSelect.value : '';
      var count = 0;

      cards.forEach(function (card) {
        var matched = matchCard(card, keyword, typeValue, regionValue);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          count += 1;
        }
      });

      if (resultText) {
        resultText.textContent = '当前显示 ' + count + ' 部影片';
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', count === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }

    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        applyFilter();
      });
    }

    applyFilter();
  }
})();
