/* ── i18n ─────────────────────────────────────────────────────── */

var currentLang = "en";

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem("lang", lang);

  var attr = "data-" + (lang === "sv" ? "se" : "en");

  // Text content
  document.querySelectorAll("[data-en]").forEach(function (el) {
    var val = el.getAttribute(attr);
    if (val) el.textContent = val;
  });

  // Placeholders
  document.querySelectorAll("[data-en-ph]").forEach(function (el) {
    var phAttr = attr + "-ph";
    var val = el.getAttribute(phAttr);
    if (val) el.placeholder = val;
  });

  // Update toggle button text
  var toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.classList.toggle("is-en", lang === "en");
    toggle.classList.toggle("is-sv", lang === "sv");
    toggle.setAttribute("aria-pressed", String(lang === "sv"));
    toggle.setAttribute("aria-label", lang === "sv" ? "Switch to English" : "Switch to Swedish");
  }
}

function t(key) {
  var map = {
    en: {
      "error.required": "Please fill in all required fields.",
      "error.email": "Please enter a valid email address.",
      "error.turnstile": "Please complete the verification step.",
      "error.config": "Turnstile is not configured yet. Add your site key before going live.",
      "error.send": "Something went wrong. Please try again.",
      "sending": "Sending...",
      "submit": "Apply for Early Access"
    },
    sv: {
      "error.required": "Vänligen fyll i alla obligatoriska fält.",
      "error.email": "Vänligen ange en giltig e-postadress.",
      "error.turnstile": "Vänligen slutför verifieringen.",
      "error.config": "Turnstile är inte konfigurerat ännu. Lägg till din site key innan lansering.",
      "error.send": "Något gick fel. Försök igen.",
      "sending": "Skickar...",
      "submit": "Ansök om tidig tillgång"
    }
  };
  var lang = currentLang;
  return (map[lang] && map[lang][key]) || (map.en[key]) || key;
}

/* ── Form ─────────────────────────────────────────────────────── */

function initForm() {
  var form = document.getElementById("enquiry-form");
  if (!form) return;

  var siteKeyMeta = document.querySelector('meta[name="turnstile-site-key"]');
  var successEl = document.getElementById("form-success");
  var errorEl = document.getElementById("form-error");
  var submitBtn = document.getElementById("submitBtn");
  var messageEl = document.getElementById("message");
  var messageCounter = document.getElementById("messageCounter");
  var turnstileWidget = form.querySelector(".cf-turnstile");
  var submitting = false;
  var turnstileSiteKey = siteKeyMeta ? siteKeyMeta.getAttribute("content") : "";

  if (turnstileWidget) {
    turnstileWidget.setAttribute("data-sitekey", turnstileSiteKey || "");
  }

  function updateMessageCounter() {
    if (!messageEl || !messageCounter) return;
    var max = Number(messageEl.getAttribute("maxlength")) || 0;
    var current = messageEl.value.length;
    messageCounter.textContent = current + " / " + max;
  }

  if (messageEl && messageCounter) {
    messageEl.addEventListener("input", updateMessageCounter);
    updateMessageCounter();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitting) return;

    hideError();

    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var companyType = form.elements.companyType.value;
    var builderType = form.elements.builderType.value;

    if (!name || !email || !companyType || !builderType) {
      showError(t("error.required"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError(t("error.email"));
      return;
    }

    if (!turnstileSiteKey || turnstileSiteKey === "YOUR_TURNSTILE_SITE_KEY") {
      showError(t("error.config"));
      return;
    }

    if (!form.elements["cf-turnstile-response"] || !form.elements["cf-turnstile-response"].value) {
      showError(t("error.turnstile"));
      return;
    }

    submitting = true;
    submitBtn.textContent = t("sending");
    submitBtn.disabled = true;

    var formData = new FormData(form);

    fetch("/api/enquiry", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData
    })
    .then(function (res) {
      if (res.ok) {
        form.classList.add("hidden");
        successEl.classList.remove("hidden");
      } else {
        resetSubmit();
        res.json().then(function (data) {
          showError((data && data.error) || t("error.send"));
        }).catch(function () {
          showError(t("error.send"));
        });
      }
    })
    .catch(function () {
      resetSubmit();
      showError(t("error.send"));
    });
  });

  function resetSubmit() {
    submitBtn.textContent = t("submit");
    submitBtn.disabled = false;
    submitting = false;
    if (window.turnstile && typeof window.turnstile.reset === "function" && turnstileWidget) {
      window.turnstile.reset(turnstileWidget);
    }
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }

  function hideError() {
    errorEl.classList.add("hidden");
  }
}

function initHeroScrollIndicator() {
  var indicator = document.querySelector(".hero-scroll-indicator");
  if (!indicator) return;

  function syncIndicator() {
    indicator.classList.toggle("is-hidden", window.scrollY > 8);
  }

  window.addEventListener("scroll", syncIndicator, { passive: true });
  syncIndicator();
}

/* ── Init ─────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function () {
  var saved = localStorage.getItem("lang");
  var browserLang = navigator.language.slice(0, 2);
  var lang = saved || (browserLang === "sv" ? "sv" : "en");
  setLanguage(lang);

  document.getElementById("langToggle").addEventListener("click", function () {
    setLanguage(currentLang === "en" ? "sv" : "en");
  });

  initForm();
  initHeroScrollIndicator();
});
