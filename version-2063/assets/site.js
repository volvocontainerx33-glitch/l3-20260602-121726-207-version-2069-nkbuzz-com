import { H as Hls } from "./hls-vendor-dru42stk.js";
import { SEARCH_INDEX } from "./search-index.js";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMenu() {
  const button = $('[data-menu-toggle]');
  const nav = $('[data-main-nav]');
  if (!button || !nav) {
    return;
  }
  button.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

function setupHero() {
  const hero = $('[data-hero]');
  if (!hero) {
    return;
  }
  const slides = $$('[data-hero-slide]', hero);
  const dots = $$('[data-hero-dot]', hero);
  if (slides.length <= 1) {
    return;
  }
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === active);
    });
  };

  const start = () => {
    timer = window.setInterval(() => show(active + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      stop();
      show(Number(dot.dataset.heroDot || 0));
      start();
    });
  });

  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  show(0);
  start();
}

function setupGlobalSearch() {
  $$('[data-global-search]').forEach((box) => {
    const input = $('[data-search-input]', box);
    const panel = $('[data-search-panel]', box);
    if (!input || !panel) {
      return;
    }

    const render = (query) => {
      const value = query.trim().toLowerCase();
      if (value.length < 1) {
        panel.classList.remove('open');
        panel.innerHTML = '';
        return;
      }
      const hits = SEARCH_INDEX
        .filter((item) => {
          const haystack = `${item.title} ${item.year} ${item.genre} ${item.region} ${item.type} ${item.category}`.toLowerCase();
          return haystack.includes(value);
        })
        .slice(0, 12);

      if (!hits.length) {
        panel.innerHTML = '<div class="search-result"><strong>未找到匹配影片</strong><span>请尝试更短的关键词</span></div>';
        panel.classList.add('open');
        return;
      }

      const depth = location.pathname.includes('/movie/') || location.pathname.includes('/category/') ? '../' : './';
      panel.innerHTML = hits.map((item) => `
        <a class="search-result" href="${depth}${item.url}">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(item.year)} · ${escapeHtml(item.region)} · ${escapeHtml(item.genre)}</span>
        </a>
      `).join('');
      panel.classList.add('open');
    };

    input.addEventListener('input', () => render(input.value));
    document.addEventListener('click', (event) => {
      if (!box.contains(event.target)) {
        panel.classList.remove('open');
      }
    });
  });
}

function setupLocalFilters() {
  const filterInput = $('[data-local-filter]');
  const sortSelect = $('[data-sort-select]');
  const grid = $('[data-card-grid]');
  if (!grid) {
    return;
  }
  const originalCards = $$('[data-card]', grid);

  const noResults = document.createElement('div');
  noResults.className = 'no-results';
  noResults.textContent = '没有匹配的影片，请调整筛选条件。';

  const apply = () => {
    const keyword = (filterInput?.value || '').trim().toLowerCase();
    const sortValue = sortSelect?.value || 'default';
    let cards = originalCards.slice();

    if (sortValue === 'year-desc') {
      cards.sort((a, b) => Number(b.dataset.year || 0) - Number(a.dataset.year || 0));
    } else if (sortValue === 'rating-desc') {
      cards.sort((a, b) => {
        const ar = Number($('.rating-pill', a)?.textContent || 0);
        const br = Number($('.rating-pill', b)?.textContent || 0);
        return br - ar;
      });
    } else if (sortValue === 'title-asc') {
      cards.sort((a, b) => (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN'));
    }

    grid.innerHTML = '';
    let visible = 0;
    cards.forEach((card) => {
      const haystack = `${card.dataset.title || ''} ${card.dataset.year || ''} ${card.dataset.genre || ''} ${card.dataset.region || ''} ${card.dataset.type || ''}`.toLowerCase();
      if (!keyword || haystack.includes(keyword)) {
        grid.appendChild(card);
        visible += 1;
      }
    });
    if (!visible) {
      grid.appendChild(noResults);
    }
  };

  filterInput?.addEventListener('input', apply);
  sortSelect?.addEventListener('change', apply);
}

function setupPlayers() {
  $$('[data-player]').forEach((shell) => {
    const video = $('video', shell);
    const button = $('[data-play-button]', shell);
    const message = $('[data-player-message]', shell);
    const source = shell.dataset.src;
    let hls = null;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text;
      }
    };

    const start = async () => {
      if (!video || !source) {
        setMessage('播放源暂不可用。');
        return;
      }
      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (Hls && Hls.isSupported()) {
          hls = hls || new Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          setMessage('当前浏览器暂不支持 HLS 播放。');
          return;
        }
        shell.classList.add('is-playing');
        await video.play();
      } catch (error) {
        shell.classList.remove('is-playing');
        setMessage('播放初始化失败，请检查网络或播放源。');
      }
    };

    button?.addEventListener('click', start);
    video?.addEventListener('play', () => shell.classList.add('is-playing'));
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

setupMenu();
setupHero();
setupGlobalSearch();
setupLocalFilters();
setupPlayers();
