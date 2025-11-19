document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const urlInput = form.querySelector('input[name="url"]');
  const messageDiv = document.getElementById('message');
  const searchInput = document.getElementById('search');
  const tableBody = document.getElementById('tableBody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));

  urlInput.addEventListener('blur', () => {
    const isValid = /^https?:\/\/.+/.test(urlInput.value);
    urlInput.classList.toggle('border-red-500', !isValid);
    urlInput.classList.toggle('border-green-500', isValid);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    messageDiv.textContent = '';
    messageDiv.className = '';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        messageDiv.textContent = `Success! Link: ${window.location.origin}/${result.code}`;
        messageDiv.className = 'text-green-600';
        form.reset();
        location.reload();
      } else {
        messageDiv.textContent = result.error;
        messageDiv.className = 'text-red-600';
      }
    } catch (err) {
      messageDiv.textContent = 'Network error';
      messageDiv.className = 'text-red-600';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Link';
    }
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });

  window.deleteLink = async (code) => {
    if (confirm('Delete this link?')) {
      await fetch(`/api/links/${code}`, { method: 'DELETE' });
      location.reload();
    }
  };
});