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

  loadLatestComments();
});
