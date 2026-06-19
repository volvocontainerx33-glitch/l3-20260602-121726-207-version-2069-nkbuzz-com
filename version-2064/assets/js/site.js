(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    showSlide(0);
    restart();
  }

  var tools = document.querySelector("[data-catalog-tools]");
  var catalog = document.querySelector("[data-catalog]");

  if (tools && catalog) {
    var searchInput = tools.querySelector(".catalog-search");
    var categorySelect = tools.querySelector(".catalog-filter");
    var emptyState = tools.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function filterCards() {
      var query = normalize(searchInput ? searchInput.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardCategory = normalize(card.getAttribute("data-category"));
        var queryMatched = !query || haystack.indexOf(query) !== -1;
        var categoryMatched = !category || cardCategory === category;
        var visible = queryMatched && categoryMatched;

        card.classList.toggle("is-hidden", !visible);

        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", shown === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterCards);
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", filterCards);
    }

    filterCards();
  }
})();
