(() => {
  const dialog = document.querySelector('[data-role-dialog]');
  const roleName = dialog?.querySelector('[data-role-name]');
  const closeButton = dialog?.querySelector('[data-dialog-close]');
  let trigger = null;

  document.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => {
      trigger = button;
      if (roleName) roleName.textContent = button.dataset.role;
      if (dialog?.showModal) dialog.showModal();
    });
  });

  closeButton?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('close', () => trigger?.focus());
})();
