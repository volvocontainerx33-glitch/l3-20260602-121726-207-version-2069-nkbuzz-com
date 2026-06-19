(function() {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    document.addEventListener("DOMContentLoaded", function() {
        var toggle = $(".mobile-toggle");
        var mobileNav = $(".mobile-nav");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = $all(".hero-slide");
        var dots = $all(".hero-dot");
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });

            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        if (slides.length) {
            dots.forEach(function(dot, index) {
                dot.addEventListener("click", function() {
                    showSlide(index);
                });
            });

            window.setInterval(function() {
                showSlide(current + 1);
            }, 5200);
        }

        var filterPanel = $(".filter-panel");

        if (filterPanel) {
            var input = $(".filter-input", filterPanel);
            var year = $(".filter-year", filterPanel);
            var type = $(".filter-type", filterPanel);
            var region = $(".filter-region", filterPanel);
            var cards = $all(".movie-card");
            var noResults = $(".no-results");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (input && query) {
                input.value = query;
            }

            function runFilter() {
                var keyword = normalize(input ? input.value : "");
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var r = region ? region.value : "";
                var visible = 0;

                cards.forEach(function(card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var cardRegion = card.getAttribute("data-region") || "";
                    var ok = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }

                    if (y && y !== cardYear) {
                        ok = false;
                    }

                    if (t && t !== cardType) {
                        ok = false;
                    }

                    if (r && r !== cardRegion) {
                        ok = false;
                    }

                    card.style.display = ok ? "" : "none";

                    if (ok) {
                        visible += 1;
                    }
                });

                if (noResults) {
                    noResults.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, type, region].forEach(function(control) {
                if (control) {
                    control.addEventListener("input", runFilter);
                    control.addEventListener("change", runFilter);
                }
            });

            runFilter();
        }
    });
})();
