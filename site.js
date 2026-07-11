document.addEventListener('DOMContentLoaded', () => {
  const firstVisitModal = document.getElementById('firstVisitFeedbackModal');
  const openFeedbackFromModal = document.getElementById('openFeedbackFromModal');
  const closeFeedbackTriggers = Array.from(document.querySelectorAll('[data-close-feedback-modal]'));
  const firstVisitStorageKey = 'meuHoleriteFeedbackModalSeen';
  const commentsSection = document.getElementById('commentsEmbed');

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
    });
  }
});
