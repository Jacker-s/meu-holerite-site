import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDVSev7T7-U_61ufbTUJW3Lk9zrUv942IU',
  authDomain: 'meu-holerite-c81cd.firebaseapp.com',
  projectId: 'meu-holerite-c81cd',
  storageBucket: 'meu-holerite-c81cd.firebasestorage.app',
  messagingSenderId: '219618099535'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCommentDate(timestamp) {
  if (!timestamp?.toDate) return 'agora mesmo';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(timestamp.toDate());
}

function formatNewsDate(timestamp) {
  if (!timestamp?.toDate) return 'publicado agora';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(timestamp.toDate());
}

function buildNewsDetailUrl(slug) {
  return `./noticias/#${encodeURIComponent(slug || '')}`;
}

function buildRelativeNewsDetailUrl(slug) {
  return `../noticias/#${encodeURIComponent(slug || '')}`;
}

function normalizeNewsDoc(doc) {
  const data = doc.data() || {};
  return {
    id: doc.id,
    title: data.title || '',
    summary: data.summary || '',
    content: data.content || '',
    imageUrl: data.imageUrl || '',
    ctaUrl: data.ctaUrl || '',
    ctaLabel: data.ctaLabel || 'Saiba mais',
    slug: data.slug || doc.id,
    category: data.category || 'Atualização',
    featured: Boolean(data.featured),
    published: data.published !== false,
    createdAt: data.createdAt || null
  };
}

function renderHomeFeaturedNews(item) {
  const featuredNews = document.getElementById('homeFeaturedNews');
  if (!featuredNews || !item) return;

  const imageMarkup = item.imageUrl
    ? `<div class="live-news-feature-media"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" /></div>`
    : '';

  const ctaMarkup = item.ctaUrl
    ? `<a class="button primary news-inline-button" href="${escapeHtml(item.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.ctaLabel || 'Saiba mais')}</a>`
    : '';

  featuredNews.innerHTML = `
    ${imageMarkup}
    <div class="live-news-feature-body">
      <span class="live-pill">${escapeHtml(item.category)} • ${escapeHtml(formatNewsDate(item.createdAt))}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary || item.content || '')}</p>
      <div class="live-news-actions">
        <a class="button soft news-inline-button" href="${buildNewsDetailUrl(item.slug)}">Abrir notícia</a>
        ${ctaMarkup}
      </div>
    </div>
  `;
}

function renderHomeNewsList(items) {
  const homeNewsList = document.getElementById('homeNewsList');
  if (!homeNewsList) return;

  if (!items.length) {
    homeNewsList.innerHTML = '';
    return;
  }

  homeNewsList.innerHTML = items.map((item) => {
    const imageMarkup = item.imageUrl
      ? `<div class="live-news-mini-media"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" /></div>`
      : '<div class="live-news-mini-media"></div>';

    const ctaMarkup = item.ctaUrl
      ? `<a class="button primary news-inline-button" href="${escapeHtml(item.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.ctaLabel || 'Saiba mais')}</a>`
      : '';

    return `
      <article class="live-news-mini">
        ${imageMarkup}
        <div class="live-news-mini-body">
          <span class="section-tag">${escapeHtml(item.category)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.summary || item.content || '')}</p>
          <div class="mini-news-actions">
            <a class="button soft news-inline-button" href="${buildNewsDetailUrl(item.slug)}">Ver detalhes</a>
            ${ctaMarkup}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderNewsPage(items) {
  const newsPageList = document.getElementById('newsPageList');
  if (!newsPageList) return;

  if (!items.length) {
    newsPageList.innerHTML = `
      <article class="news-article news-empty">
        <div class="news-meta">
          <span class="section-tag">Sem notícias</span>
          <span>no momento</span>
        </div>
        <h2>Nenhuma notícia publicada agora</h2>
        <p class="article-summary">Quando uma nova atualização for publicada no painel, ela aparece aqui automaticamente.</p>
      </article>
    `;
    return;
  }

  newsPageList.innerHTML = items.map((item) => {
    const imageMarkup = item.imageUrl
      ? `<div class="news-article-cover"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" /></div>`
      : '';

    const ctaMarkup = item.ctaUrl
      ? `<a class="button primary" href="${escapeHtml(item.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.ctaLabel || 'Saiba mais')}</a>`
      : '';

    return `
      <article class="news-article" id="${escapeHtml(item.slug)}">
        ${imageMarkup}
        <div class="news-meta">
          <span class="section-tag">${escapeHtml(item.category)}</span>
          <span>${escapeHtml(formatNewsDate(item.createdAt))}</span>
        </div>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="article-summary">${escapeHtml(item.summary || '')}</p>
        <div class="article-body">${escapeHtml(item.content || '').replace(/\n/g, '<br />')}</div>
        <div class="article-actions">
          ${ctaMarkup}
          <a class="button soft" href="../#comentarios">Deixar comentário</a>
        </div>
      </article>
    `;
  }).join('');
}

async function loadSiteNews() {
  const homeSpotlightSection = document.getElementById('newsSpotlightSection');
  const newsPageList = document.getElementById('newsPageList');

  if (!homeSpotlightSection && !newsPageList) return;

  try {
    const newsQuery = query(
      collection(db, 'site_news'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(newsQuery);
    const items = snapshot.docs
      .map(normalizeNewsDoc)
      .filter((item) => item.published && (item.title || item.summary || item.content))
      .slice(0, 12);

    if (homeSpotlightSection) {
      if (items.length) {
        homeSpotlightSection.hidden = false;
        const featuredItem = items.find((item) => item.featured) || items[0];
        const secondaryItems = items.filter((item) => item.id !== featuredItem.id).slice(0, 3);
        renderHomeFeaturedNews(featuredItem);
        renderHomeNewsList(secondaryItems);
      } else {
        homeSpotlightSection.hidden = true;
      }
    }

    if (newsPageList) {
      renderNewsPage(items);
    }
  } catch (error) {
    if (homeSpotlightSection) {
      homeSpotlightSection.hidden = true;
    }

    if (newsPageList) {
      newsPageList.innerHTML = `
        <article class="news-article news-empty">
          <div class="news-meta">
            <span class="section-tag">Erro</span>
            <span>firebase</span>
          </div>
          <h2>Não foi possível carregar as notícias</h2>
          <p class="article-summary">Tente novamente em instantes. O conteúdo publicado continua salvo, mas não pôde ser buscado agora.</p>
        </article>
      `;
    }
  }
}

async function loadLatestComments() {
  const publicCommentsList = document.getElementById('publicCommentsList');
  if (!publicCommentsList) return;

  try {
    const commentsQuery = query(
      collection(db, 'site_comments'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(commentsQuery);
    if (snapshot.empty) {
      publicCommentsList.innerHTML = `
        <article class="comment-card">
          <div class="comment-head">
            <strong>Nenhum comentário ainda</strong>
            <span>seja o primeiro</span>
          </div>
          <p>As primeiras críticas e sugestões publicadas vão aparecer aqui.</p>
        </article>
      `;
      return;
    }

    publicCommentsList.innerHTML = snapshot.docs.map((doc) => {
      const data = doc.data() || {};
      return `
        <article class="comment-card">
          <div class="comment-head">
            <strong>${escapeHtml(data.name || 'Usuário')}</strong>
            <span>${escapeHtml(data.role || 'Usuário do app')} • ${escapeHtml(formatCommentDate(data.createdAt))}</span>
          </div>
          <p>${escapeHtml(data.message || '')}</p>
        </article>
      `;
    }).join('');
  } catch (error) {
    publicCommentsList.innerHTML = `
      <article class="comment-card">
        <div class="comment-head">
          <strong>Não foi possível carregar</strong>
          <span>firebase</span>
        </div>
        <p>Os comentários públicos não puderam ser carregados agora.</p>
      </article>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const firstVisitModal = document.getElementById('firstVisitFeedbackModal');
  const openFeedbackFromModal = document.getElementById('openFeedbackFromModal');
  const closeFeedbackTriggers = Array.from(document.querySelectorAll('[data-close-feedback-modal]'));
  const firstVisitStorageKey = 'meuHoleriteFeedbackModalSeen';
  const commentsSection = document.getElementById('publicCommentsForm');
  const commentsForm = document.getElementById('publicCommentsForm');
  const commentsFormStatus = document.getElementById('commentsFormStatus');
  const submitCommentButton = document.getElementById('submitCommentButton');

  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const closeFeedbackModal = () => {
    if (!firstVisitModal) return;
    firstVisitModal.classList.remove('is-open');
    firstVisitModal.setAttribute('aria-hidden', 'true');
  };

  const openFeedbackModal = () => {
    if (!firstVisitModal) return;
    firstVisitModal.classList.add('is-open');
    firstVisitModal.setAttribute('aria-hidden', 'false');
  };

  if (firstVisitModal) {
    const hasSeenModal = localStorage.getItem(firstVisitStorageKey) === 'true';
    if (!hasSeenModal) {
      window.setTimeout(() => {
        openFeedbackModal();
        localStorage.setItem(firstVisitStorageKey, 'true');
      }, 600);
    }

    closeFeedbackTriggers.forEach((trigger) => {
      trigger.addEventListener('click', closeFeedbackModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeFeedbackModal();
      }
    });
  }

  if (openFeedbackFromModal && commentsSection) {
    openFeedbackFromModal.addEventListener('click', () => {
      closeFeedbackModal();
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => {
        const firstField = commentsSection.querySelector('[name="name"]');
        if (firstField) firstField.focus();
      }, 450);
    });
  }

  if (commentsForm) {
    commentsForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = commentsForm.querySelector('[name="name"]').value.trim();
      const role = commentsForm.querySelector('[name="role"]').value.trim();
      const message = commentsForm.querySelector('[name="message"]').value.trim();

      if (!name || !message) {
        if (commentsFormStatus) {
          commentsFormStatus.textContent = 'Preencha seu nome e sua mensagem.';
        }
        return;
      }

      try {
        if (submitCommentButton) submitCommentButton.disabled = true;
        if (commentsFormStatus) commentsFormStatus.textContent = 'Publicando comentário...';

        await addDoc(collection(db, 'site_comments'), {
          name,
          role: role || 'Usuário do app',
          message,
          createdAt: serverTimestamp()
        });

        commentsForm.reset();
        if (commentsFormStatus) {
          commentsFormStatus.textContent = 'Comentário publicado com sucesso.';
        }
        await loadLatestComments();
      } catch (error) {
        if (commentsFormStatus) {
          commentsFormStatus.textContent = 'Não foi possível publicar agora. Verifique as regras do Firebase.';
        }
      } finally {
        if (submitCommentButton) submitCommentButton.disabled = false;
      }
    });
  }

  loadSiteNews();
  loadLatestComments();
});
