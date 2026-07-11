document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const feedbackForm = document.getElementById('feedbackMailForm');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = feedbackForm.querySelector('[name="name"]').value.trim();
      const role = feedbackForm.querySelector('[name="role"]').value.trim();
      const email = feedbackForm.querySelector('[name="email"]').value.trim();
      const message = feedbackForm.querySelector('[name="message"]').value.trim();

      const subject = encodeURIComponent(`Comentario sobre o Meu Holerite - ${name || 'Usuario'}`);
      const body = encodeURIComponent(
        `Nome: ${name}\n` +
        `Perfil: ${role || 'Usuario do app'}\n` +
        `Email: ${email || 'Nao informado'}\n\n` +
        `Mensagem:\n${message}`
      );

      window.location.href = `mailto:suporte@meuholerite.me?subject=${subject}&body=${body}`;
    });
  }
});
