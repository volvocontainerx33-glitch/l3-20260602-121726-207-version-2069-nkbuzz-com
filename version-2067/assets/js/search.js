(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var results = document.querySelector('[data-search-results]');
  var note = document.querySelector('[data-search-note]');

  if (!form || !input || !results || !window.MOVIE_INDEX) {
    return;
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function render(items, query) {
    results.innerHTML = '';

    if (note) {
      if (query) {
        note.textContent = '搜索“' + query + '”共找到 ' + items.length + ' 部影片。';
      } else {
        note.textContent = '输入片名、类型、地区、年份或标签，即可筛选片库内容。';
      }
    }

    items.slice(0, 120).forEach(function (movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.setAttribute('data-title', movie.title);
      article.setAttribute('data-year', movie.year);
      article.setAttribute('data-region', movie.region);
      article.setAttribute('data-type', movie.type);
      article.setAttribute('data-genre', movie.genre);
      article.setAttribute('data-tags', movie.tags.join(' '));

      article.innerHTML = [
        '<a class="movie-cover" href="detail/' + movie.id + '.html" aria-label="观看 ' + movie.title.replace(/"/g, '&quot;') + '">',
        '  <img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy" onerror="this.classList.add(\'is-hidden\');" />',
        '  <span class="movie-score">' + movie.score + '</span>',
        '  <span class="movie-year">' + movie.year + '</span>',
        '</a>',
        '<div class="movie-info">',
        '  <h3><a href="detail/' + movie.id + '.html">' + movie.title + '</a></h3>',
        '  <p class="movie-line">' + movie.oneLine + '</p>',
        '  <div class="movie-meta">',
        '    <a href="category/' + movie.categorySlug + '.html">' + movie.categoryName + '</a>',
        '    <span>' + movie.region + '</span>',
        '    <span>' + movie.type + '</span>',
        '  </div>',
        '  <div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + tag + '</span>'; }).join('') + '</div>',
        '</div>'
      ].join('');

      results.appendChild(article);
    });
  }

  function search(query) {
    var normalized = normalize(query).trim();

    if (!normalized) {
      render(window.MOVIE_INDEX.slice(0, 60), '');
      return;
    }

    var items = window.MOVIE_INDEX.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags.join(' '),
        movie.oneLine
      ].join(' '));

      return haystack.indexOf(normalized) !== -1;
    });

    render(items, query);
  }

  var initialQuery = getQuery();
  input.value = initialQuery;
  search(initialQuery);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
    window.history.replaceState(null, '', url);
    search(query);
  });
})();
