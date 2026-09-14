export function initNavigation({ onViewChanged } = {}) {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((item) => item.classList.remove("is-active"));
      views.forEach((view) => view.classList.remove("is-active"));

      tab.classList.add("is-active");

      const viewId = tab.dataset.view;
      document.getElementById(viewId)?.classList.add("is-active");

      onViewChanged?.(viewId);
    });
  });
}
