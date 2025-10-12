// Toggle menu mobile
function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.classList.toggle("show");
}

// Validation formulaire
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    alert("Merci de remplir tous les champs.");
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    alert("Email invalide.");
    return;
  }

  alert("Message envoyé avec succès !");
  this.reset();
});
