/** Parcerias BR — vanilla JS, no dependencies */
(function () {
  "use strict";

  var EMAIL = "jose@parceriasbr.com";
  var WA_URL =
    "https://wa.me/60177869724?text=" +
    encodeURIComponent("Olá! Recebi um e-mail da Parcerias BR e queria saber mais.");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* WhatsApp links already in HTML; keep a hook if needed later */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    if (!el.getAttribute("href")) el.setAttribute("href", WA_URL);
  });

  /* Sticky header shadow */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  function closeMenu() {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
    nav.classList.add("is-open");
    document.body.classList.add("menu-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMenu();
      else openMenu();
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 800) closeMenu();
    });
  }

  /* Smooth scroll with sticky-header offset */
  function scrollToEl(el) {
    if (!el) return;
    var offset = (header ? header.offsetHeight : 0) + 10;
    var top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToEl(target);
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  /* Active section in nav (homepage only) */
  var navLinks = document.querySelectorAll('.site-nav a[href^="#"], .site-nav a[href*="index.html#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href") || "";
    var id = href.split("#")[1];
    var sec = id ? document.getElementById(id) : null;
    if (sec) sections.push({ id: id, el: sec, link: link });
  });

  function setActive(id) {
    document.querySelectorAll(".site-nav a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      var match = !!id && (href === "#" + id || href.endsWith("#" + id));
      a.classList.toggle("is-active", match);
    });
  }

  function updateActive() {
    if (!sections.length) return;
    var offset = (header ? header.offsetHeight : 0) + 80;
    var y = window.scrollY + offset;
    var id = null;
    if (window.scrollY > 80) {
      sections.forEach(function (s) {
        if (s.el.offsetTop <= y) id = s.id;
      });
    }
    setActive(id);
  }

  if (sections.length) {
    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Hero fade-in */
  var heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    if (reduceMotion) heroContent.classList.add("is-ready");
    else requestAnimationFrame(function () { heroContent.classList.add("is-ready"); });
  }

  /* Interactive stepper / format tabs */
  function initStepper(root, auto) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-step]"));
    var panels = Array.prototype.slice.call(root.querySelectorAll(".step-panel"));
    if (!tabs.length) return;
    var currentStep = 1;
    var timer = null;

    function showStep(n, user) {
      currentStep = n;
      tabs.forEach(function (tab) {
        var on = Number(tab.getAttribute("data-step")) === n;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (panel) {
        var on = Number(panel.getAttribute("data-panel")) === n;
        panel.classList.toggle("is-active", on);
        panel.classList.remove("is-animating");
        if (on && !reduceMotion && user !== "init") {
          void panel.offsetWidth;
          panel.classList.add("is-animating");
        }
      });
    }

    function startAuto() {
      stopAuto();
      if (reduceMotion || !auto) return;
      timer = window.setInterval(function () {
        showStep((currentStep % tabs.length) + 1, "auto");
      }, 6000);
    }

    function stopAuto() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showStep(Number(tab.getAttribute("data-step")), "user");
        startAuto();
      });
      tab.addEventListener("keydown", function (e) {
        var i = tabs.indexOf(tab);
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          var next = tabs[(i + 1) % tabs.length];
          next.focus();
          showStep(Number(next.getAttribute("data-step")), "user");
          startAuto();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          var prev = tabs[(i - 1 + tabs.length) % tabs.length];
          prev.focus();
          showStep(Number(prev.getAttribute("data-step")), "user");
          startAuto();
        }
      });
    });

    if (auto) {
      root.addEventListener("mouseenter", stopAuto);
      root.addEventListener("mouseleave", startAuto);
      root.addEventListener("focusin", stopAuto);
      root.addEventListener("focusout", function (e) {
        if (!root.contains(e.relatedTarget)) startAuto();
      });
    }

    showStep(1, "init");
    startAuto();
    return { showStep: showStep, stopAuto: stopAuto };
  }

  var stepperControls = [];
  document.querySelectorAll("[data-stepper]").forEach(function (root) {
    var auto = root.getAttribute("data-auto") !== "false";
    stepperControls.push(initStepper(root, auto));
  });
  window.__setStep = function (n) {
    stepperControls.forEach(function (c) {
      if (c) { c.showStep(n, "user"); c.stopAuto(); }
    });
  };

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var panel = item.querySelector(".faq-a");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var open = item.classList.contains("is-open");
      document.querySelectorAll(".faq-item.is-open").forEach(function (other) {
        other.classList.remove("is-open");
        var b = other.querySelector(".faq-q");
        var p = other.querySelector(".faq-a");
        if (b) b.setAttribute("aria-expanded", "false");
        if (p) p.hidden = true;
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      } else {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        panel.hidden = true;
      }
    });
  });

  window.__openFaq = function (index) {
    var items = document.querySelectorAll(".faq-item");
    var item = items[index];
    if (!item) return;
    var btn = item.querySelector(".faq-q");
    if (btn) btn.click();
  };

  /* Contact form → mailto */
  var form = document.getElementById("contato-form");
  if (form) {
    var fields = {
      nome: form.querySelector('[name="nome"]'),
      email: form.querySelector('[name="email"]'),
      instagram: form.querySelector('[name="instagram"]'),
      mensagem: form.querySelector('[name="mensagem"]')
    };

    function setError(input, msg) {
      var field = input.closest(".field");
      var err = field ? field.querySelector(".field-error") : null;
      field.classList.add("is-invalid");
      if (err) err.textContent = msg;
      input.setAttribute("aria-invalid", "true");
    }

    function clearError(input) {
      var field = input.closest(".field");
      if (field) field.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
    }

    function valNome(v) { return v.replace(/\s+/g, " ").trim().length >= 2; }
    function valEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
    function valIg(v) { return /^@?[A-Za-z0-9._]{1,30}$/.test(v.trim()); }
    function valMsg(v) { return v.trim().length >= 10; }

    function validate() {
      var ok = true;
      var nome = fields.nome.value;
      var email = fields.email.value;
      var ig = fields.instagram.value;
      var msg = fields.mensagem.value;

      clearError(fields.nome);
      clearError(fields.email);
      clearError(fields.instagram);
      clearError(fields.mensagem);

      if (!valNome(nome)) { setError(fields.nome, "Digite seu nome."); ok = false; }
      if (!valEmail(email)) { setError(fields.email, "Digite um e-mail válido."); ok = false; }
      if (!valIg(ig)) { setError(fields.instagram, "Digite seu @ do Instagram."); ok = false; }
      if (!valMsg(msg)) { setError(fields.mensagem, "Escreva uma mensagem (pelo menos 10 caracteres)."); ok = false; }
      return ok;
    }

    Object.keys(fields).forEach(function (k) {
      fields[k].addEventListener("input", function () { clearError(fields[k]); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var first = form.querySelector(".field.is-invalid input, .field.is-invalid textarea");
        if (first) first.focus();
        return;
      }
      var nome = fields.nome.value.replace(/\s+/g, " ").trim();
      var email = fields.email.value.trim();
      var ig = fields.instagram.value.trim();
      if (ig.charAt(0) !== "@") ig = "@" + ig;
      var msg = fields.mensagem.value.trim();

      var subject = "Contato pelo site — " + nome;
      var body =
        "Nome: " + nome + "\n" +
        "E-mail: " + email + "\n" +
        "Instagram: " + ig + "\n\n" +
        msg;

      window.location.href =
        "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* Copy email + toast */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("is-on");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-on");
    }, 2200);
  }

  document.querySelectorAll("[data-copy-email]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var done = function () { showToast("E-mail copiado."); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done).catch(function () {
          fallbackCopy(EMAIL) ? done() : showToast("Não foi possível copiar.");
        });
      } else if (fallbackCopy(EMAIL)) {
        done();
      } else {
        showToast("Não foi possível copiar.");
      }
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  /* Back to top */
  var backTop = document.querySelector(".back-top");
  function onScrollTop() {
    if (!backTop) return;
    backTop.classList.toggle("is-visible", window.scrollY > 480);
  }
  onScrollTop();
  window.addEventListener("scroll", onScrollTop, { passive: true });
  if (backTop) {
    backTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
