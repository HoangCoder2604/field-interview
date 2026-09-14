let toastTimerId = null;

export function createToastController(toastElement) {
  return function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.remove("hidden");

    window.clearTimeout(toastTimerId);

    toastTimerId = window.setTimeout(() => {
      toastElement.classList.add("hidden");
    }, 2800);
  };
}
