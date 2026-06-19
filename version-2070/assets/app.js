(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var selects = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    if (!inputs.length || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    inputs.forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener("input", apply);
    });

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });

    function apply() {
      var words = inputs.map(function (input) {
        return input.value.trim().toLowerCase();
      }).filter(Boolean).join(" ");
      var year = selects.map(function (select) {
        return select.value;
      }).find(Boolean) || "";

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-keywords") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
        var matchWords = !words || words.split(/\s+/).every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
        var matchYear = !year || card.getAttribute("data-year") === year;
        card.classList.toggle("is-hidden-by-filter", !(matchWords && matchYear));
      });
    }

    apply();
  }
})();
