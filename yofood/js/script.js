// script.js - Fichier unifié avec toutes les fonctionnalités

// ---------- Utilities ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// Update year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Header behavior ----------
const header = $("header");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  if (window.scrollY > 60) {
    header.classList.add("scrolled");

    // Masquer le header au scroll vers le bas
    if (window.scrollY > lastScrollY && window.scrollY > 100) {
      header.classList.add("hidden");
    } else {
      header.classList.remove("hidden");
    }
  } else {
    header.classList.remove("scrolled", "hidden");
  }

  lastScrollY = window.scrollY;
  updateActiveLinkOnScroll();
});

// ---------- Menu mobile amélioré ----------
const hamburger = $(".hamburger");
const navList = document.querySelector("nav ul");
const navLinks = document.querySelectorAll("nav a");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navList.classList.toggle("active");
    hamburger.classList.toggle("active");
    hamburger.setAttribute(
      "aria-expanded",
      navList.classList.contains("active")
    );

    // Animation de l'icône hamburger
    if (navList.classList.contains("active")) {
      hamburger.innerHTML = '<i class="fas fa-times"></i>';
    } else {
      hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

// Fermer le menu mobile en cliquant sur un lien
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navList.classList.remove("active");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
  });
});

// ---------- Animations au défilement ----------
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");

      // Animation spécifique pour le hero
      if (entry.target.classList.contains("hero-inner")) {
        setTimeout(() => {
          entry.target.classList.add("animated");
        }, 300);
      }
    }
  });
}, observerOptions);

// Observer les éléments à animer
document
  .querySelectorAll(".fade-in, .slide-in-left, .slide-in-right, .hero-inner")
  .forEach((el) => {
    observer.observe(el);
  });

// ---------- Smooth scroll ----------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offset = 80;
      const top = target.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  });
});

// ---------- Navigation active améliorée ----------
const sections = $$("main section[id]");

function updateActiveLinkOnScroll() {
  let current = "";
  const scrollPosition = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href");
    if (href === `#${current}`) {
      link.classList.add("active");
    }
  });
}

// Amélioration de la détection de section active
function initScrollSpy() {
  const options = {
    rootMargin: "-20% 0px -55% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, options);

  sections.forEach((section) => {
    observer.observe(section);
  });
}

// ---------- Animation au chargement ----------
window.addEventListener("load", () => {
  document.querySelector(".hero-inner").classList.add("animated");
  initScrollSpy(); // Initialiser le scroll spy amélioré
});

// Écouteur de scroll pour la navigation active
window.addEventListener("scroll", updateActiveLinkOnScroll);

// ---------- Slider (Emissions) ----------
const slidesWrap = $(".slides");
const slideItems = $$(".slide");
const dots = $$(".dot");
const prevBtn = $(".prev");
const nextBtn = $(".next");
let currentSlide = 0;
const slideCount = slideItems.length || 1;

function goToSlide(index) {
  currentSlide = (index + slideCount) % slideCount;
  slidesWrap.style.transform = `translateX(-${currentSlide * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle("active", i === currentSlide));
}

if (nextBtn)
  nextBtn.addEventListener("click", () => {
    goToSlide(currentSlide + 1);
    resetSlideInterval();
  });
if (prevBtn)
  prevBtn.addEventListener("click", () => {
    goToSlide(currentSlide - 1);
    resetSlideInterval();
  });
dots.forEach((dot, i) =>
  dot.addEventListener("click", () => {
    goToSlide(i);
    resetSlideInterval();
  })
);

let slideInterval = setInterval(() => goToSlide(currentSlide + 1), 30000);
function resetSlideInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(() => goToSlide(currentSlide + 1), 30000);
}

// ---------- Gallery Lightbox ----------
const galleryItems = $$(".gallery-item");
const lightbox = $(".lightbox");
const lightboxImg = lightbox
  ? lightbox.querySelector(".lightbox-content img")
  : null;
const lightboxClose = lightbox
  ? lightbox.querySelector(".lightbox-close")
  : null;
const lightboxPrev = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
const lightboxNext = lightbox ? lightbox.querySelector(".lightbox-next") : null;
let galleryImages = [];
let currentImageIndex = 0;
if (galleryItems.length) {
  galleryImages = galleryItems.map((it) => it.querySelector("img").src);
  galleryItems.forEach((it, idx) => {
    it.addEventListener("click", () => openLightbox(idx));
  });
}

function openLightbox(index) {
  currentImageIndex = index;
  if (lightboxImg) lightboxImg.src = galleryImages[currentImageIndex];
  if (lightbox) {
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    lightbox.setAttribute("aria-hidden", "false");
  }
}
function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
    lightbox.setAttribute("aria-hidden", "true");
  }
}
function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  if (lightboxImg) lightboxImg.src = galleryImages[currentImageIndex];
}
function prevImage() {
  currentImageIndex =
    (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  if (lightboxImg) lightboxImg.src = galleryImages[currentImageIndex];
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxNext) lightboxNext.addEventListener("click", nextImage);
if (lightboxPrev) lightboxPrev.addEventListener("click", prevImage);
if (lightbox)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
document.addEventListener("keydown", (e) => {
  if (!lightbox || !lightbox.classList.contains("active")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") nextImage();
  if (e.key === "ArrowLeft") prevImage();
});

// ---------- Cart / Shop functionality ----------
const cartIcon = $(".cart-icon");
const cartPanel = $(".cart-panel");
const cartClose = $(".cart-close");
const overlay = $(".overlay");
const cartItemsContainer = $(".cart-items");
const cartCountEl = $(".cart-count");
const totalAmountEl = $(".total-amount");
const checkoutBtn = $("#checkout-btn");
const continueShopping = $("#continue-shopping");
const addToCartButtons = $$(".add-to-cart");

let cart = [];

function toggleCart() {
  const active = cartPanel.classList.toggle("active");
  overlay.classList.toggle("active", active);
  cartPanel.setAttribute("aria-hidden", !active);
  overlay.setAttribute("aria-hidden", !active);
}

if (cartIcon) cartIcon.addEventListener("click", toggleCart);
if (cartClose) cartClose.addEventListener("click", toggleCart);
if (overlay) overlay.addEventListener("click", toggleCart);
if (continueShopping) continueShopping.addEventListener("click", toggleCart);

function updateCartUI() {
  cartItemsContainer.innerHTML = "";
  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p style="text-align:center;color:var(--gris-moyen);padding:40px 0">Votre panier est vide</p>';
    cartCountEl.textContent = "0";
    totalAmountEl.textContent = "0 FCFA";
    return;
  }
  let total = 0;
  let count = 0;
  cart.forEach((item) => {
    total += item.quantity * item.price;
    count += item.quantity;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div class="cart-item-img"><img src="${
        item.img || "assets/img/product-" + item.id + ".jpg"
      }" alt="${item.name}" loading="lazy"></div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <div class="cart-item-price">${item.price.toLocaleString()} FCFA</div>
        <div class="cart-item-quantity" style="margin-top:8px;display:flex;align-items:center;gap:8px">
          <button class="decrease" data-id="${
            item.id
          }" style="background:var(--gris-clair);border:none;width:32px;height:32px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center">-</button>
          <input value="${
            item.quantity
          }" readonly style="width:40px;text-align:center;border:1px solid var(--gris-clair);padding:6px;border-radius:6px;background:#fff;font-weight:600">
          <button class="increase" data-id="${
            item.id
          }" style="background:var(--gris-clair);border:none;width:32px;height:32px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
          <button class="cart-item-remove" data-id="${
            item.id
          }" style="margin-left:8px;background:none;border:none;color:var(--orange-chaud);cursor:pointer;font-size:16px"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(div);
  });
  cartCountEl.textContent = count;
  totalAmountEl.textContent = `${total.toLocaleString()} FCFA`;

  // attach listeners
  $$(".decrease").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      changeQuantity(e.target.dataset.id, -1);
    })
  );
  $$(".increase").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      changeQuantity(e.target.dataset.id, +1);
    })
  );
  $$(".cart-item-remove").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      removeFromCart(e.target.closest("button").dataset.id);
    })
  );
}

function addToCart(id, name, price, quantity = 1) {
  const existing = cart.find((i) => i.id === id);
  if (existing) existing.quantity += quantity;
  else
    cart.push({
      id,
      name,
      price,
      quantity,
      img: "assets/img/product-" + id + ".jpg",
    });
  updateCartUI();
  showToast(`${name} ajouté au panier`);
}

function changeQuantity(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter((i) => i.id !== id);
  updateCartUI();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  updateCartUI();
}

addToCartButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = parseInt(btn.dataset.price, 10);
    const qty = parseInt(
      btn.parentElement.querySelector("input").value || 1,
      10
    );
    addToCart(id, name, price, qty);
  });
});

// quantity +/- for product cards
$$(".quantity").forEach((q) => {
  const minus = q.querySelector(".minus");
  const plus = q.querySelector(".plus");
  const input = q.querySelector("input");
  minus &&
    minus.addEventListener("click", () => {
      input.value = Math.max(1, parseInt(input.value) - 1);
    });
  plus &&
    plus.addEventListener("click", () => {
      input.value = parseInt(input.value) + 1;
    });
});

// Animation des boutons "Ajouter"
document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.textContent = "Ajouté ✓";
    btn.style.background = "var(--vert-vif)";
    setTimeout(() => {
      btn.textContent = "Ajouter";
      btn.style.background =
        "linear-gradient(135deg, var(--orange-chaud), var(--orange-fonce))";
    }, 1500);
  });
});

// ---------- Keyboard support for slider navigation ----------
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goToSlide(currentSlide - 1);
  if (e.key === "ArrowRight") goToSlide(currentSlide + 1);
});

// ---------- Contact form ----------
const contactForm = $("#contact-form");
if (contactForm)
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Message envoyé ! Nous reviendrons vers vous sous 24h.");
    contactForm.reset();
  });

// ---------- Newsletter form ----------
const newsletterForm = $(".newsletter-form");
if (newsletterForm)
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Merci pour votre abonnement à notre newsletter !");
    newsletterForm.reset();
  });

// toast notification
function showToast(msg) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText =
    "position:fixed;top:120px;right:20px;background:var(--vert-vif);color:#fff;padding:16px 20px;border-radius:var(--radius);box-shadow:var(--shadow-hover);z-index:2200;font-weight:600;max-width:300px;opacity:0;transform:translateX(100px);transition:all 0.3s ease";
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
  }, 10);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateX(100px)";
  }, 2600);
  setTimeout(() => el.remove(), 3000);
}

// ============================================================================
// FONCTIONNALITÉS WHATSAPP - COMMANDE
// ============================================================================

// Gestion de la commande WhatsApp
document.addEventListener("DOMContentLoaded", function () {
  const checkoutBtn = document.getElementById("checkout-btn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      // Vérifier si le panier n'est pas vide
      const cartItems = document.querySelectorAll(".cart-item");
      if (cartItems.length === 0) {
        alert(
          "Votre panier est vide. Ajoutez des produits avant de commander."
        );
        return;
      }

      // Récupérer les informations du panier
      const cartData = getCartData();

      // Générer le message WhatsApp
      const whatsappMessage = generateWhatsAppMessage(cartData);

      // Numéro de téléphone (à remplacer par votre numéro)
      const phoneNumber = "212687927641"; // Format international sans +

      // Ouvrir WhatsApp
      openWhatsApp(phoneNumber, whatsappMessage);
    });
  }
});

// Récupérer les données du panier
function getCartData() {
  const cartItems = [];
  const cartElements = document.querySelectorAll(".cart-item");

  cartElements.forEach((item) => {
    const name = item.querySelector("h4").textContent;
    const priceText = item.querySelector(".cart-item-price").textContent;
    const quantity = item.querySelector("input").value;
    const price = parseInt(priceText.replace(/\D/g, ""));

    cartItems.push({
      name: name,
      price: price,
      quantity: parseInt(quantity),
      total: price * parseInt(quantity),
    });
  });

  const totalElement = document.querySelector(".total-amount");
  const total = totalElement
    ? parseInt(totalElement.textContent.replace(/\D/g, ""))
    : 0;

  return {
    items: cartItems,
    total: total,
  };
}

// Générer le message WhatsApp
function generateWhatsAppMessage(cartData) {
  let message = "Bonjour Yo Food! 👋\n\n";
  message += "Je suis intéressé(e) par les produits suivants :\n\n";

  cartData.items.forEach((item, index) => {
    message += `• ${item.quantity}x ${
      item.name
    } - ${item.total.toLocaleString()} FCFA\n`;
  });

  message += `\n💰 Total : ${cartData.total.toLocaleString()} FCFA\n\n`;
  message += "Est-ce que ces produits sont toujours disponibles ?\n";
  message +=
    "Merci de me confirmer la disponibilité et les modalités de livraison.\n\n";
  message += "Cordialement";

  return encodeURIComponent(message);
}

// Ouvrir WhatsApp avec le message
function openWhatsApp(phoneNumber, message) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  window.open(whatsappUrl, "_blank");

  // Optionnel : vider le panier après la commande
  setTimeout(() => {
    if (confirm("Voulez-vous vider votre panier après cette commande ?")) {
      emptyCart();
    }
  }, 1000);
}

// Vider le panier
function emptyCart() {
  cart = [];
  updateCartUI();

  // Fermer le panier
  const cartPanel = document.querySelector(".cart-panel");
  const overlay = document.querySelector(".overlay");
  if (cartPanel && overlay) {
    cartPanel.classList.remove("active");
    overlay.classList.remove("active");
  }

  showToast("Panier vidé avec succès !");
}

// ============================================================================
// INITIALISATION
// ============================================================================

// init UI
updateCartUI();
goToSlide(0);

// Initialiser la navigation active
updateActiveLinkOnScroll();
