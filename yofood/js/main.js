// small script for mobile nav, modal video and small enhancements
document.addEventListener("DOMContentLoaded", function () {
  // year
  const y = new Date().getFullYear();
  document.getElementById("year").textContent = y;

  // nav toggle
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  navToggle.addEventListener("click", function () {
    nav.classList.toggle("show");
  });

  // video modal
  const videoButtons = document.querySelectorAll(
    ".video-card .play, .video-card"
  );
  const modal = document.getElementById("videoModal");
  const modalClose = document.getElementById("modalClose");
  const videoWrapper = document.getElementById("videoWrapper");

  function openModal(src) {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    // inject iframe (allow autoplay muted if desired)
    videoWrapper.innerHTML =
      '<iframe src="' +
      src +
      '?rel=0&autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  }
  function closeModal() {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    videoWrapper.innerHTML = "";
  }

  videoButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const target = e.currentTarget;
      const video = target.dataset.video || target.getAttribute("data-video");
      if (video) {
        openModal(video);
      }
    });
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  // simple contact submit (demo)
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert(
        "Merci — message envoyé (demo). Remplacez cette action par un backend ou un form service."
      );
      form.reset();
    });
  }
});
