(() => {
  const currentPage = document.body.dataset.page || "home";
  const isHomePage = currentPage === "home";
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  function encodeWhatsAppMessage(text) {
    return `https://wa.me/923716576445?text=${encodeURIComponent(text)}`;
  }

  function initNav() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navWrap = document.querySelector(".nav-wrap");
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      if (link.dataset.page === currentPage) link.classList.add("active");
      link.addEventListener("click", () => {
        if (navWrap && menuToggle) {
          navWrap.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        }
      });
    });

    if (menuToggle && navWrap) {
      menuToggle.addEventListener("click", () => {
        const open = navWrap.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(open));
      });
    }
  }

  function initSearch() {
    const form = document.getElementById("site-search-form");
    const input = document.getElementById("site-search");
    const clearBtn = document.getElementById("clear-search");

    if (!form || !input || !clearBtn) return;

    const redirectToHomeSearch = () => {
      const term = input.value.trim();
      const target = term ? `index.html?search=${encodeURIComponent(term)}#products` : "index.html#products";
      window.location.href = target;
    };

    if (!isHomePage) {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        redirectToHomeSearch();
      });
      clearBtn.addEventListener("click", () => input.value = "");
      return;
    }

    const grid = document.getElementById("products-grid");
    const emptyState = document.getElementById("search-empty-state");
    if (!grid || !emptyState) return;

    const cards = Array.from(grid.querySelectorAll(".product-card"));
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || "";

    const applySearch = () => {
      const term = input.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const matches = !term || text.includes(term);
        const hideOnSmall = mobileQuery.matches && card.classList.contains("hide-on-small");
        const show = matches && !hideOnSmall;

        card.style.display = show ? "" : "none";
        if (show) visibleCount += 1;
      });

      emptyState.style.display = visibleCount === 0 ? "block" : "none";
    };

    input.value = initialSearch;
    applySearch();

    input.addEventListener("input", applySearch);
    mobileQuery.addEventListener("change", applySearch);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      applySearch();
    });

    clearBtn.addEventListener("click", () => {
      input.value = "";
      applySearch();
      input.focus();
    });
  }

  function initProductSliders() {
    const sliderBlocks = document.querySelectorAll("[data-slider]");
    if (!sliderBlocks.length) return;

    sliderBlocks.forEach((slider, sliderIndex) => {
      const slides = Array.from(slider.querySelectorAll(".slide"));
      const prevBtn = slider.querySelector(".prev");
      const nextBtn = slider.querySelector(".next");
      const dotsContainer = slider.querySelector(".slider-dots");
      let active = 0;
      let timer = null;

      if (!slides.length || !dotsContainer || !prevBtn || !nextBtn) return;

      const dots = slides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to image ${index + 1}`);
        dot.addEventListener("click", () => {
          active = index;
          render();
          restart();
        });
        dotsContainer.appendChild(dot);
        return dot;
      });

      function render() {
        slides.forEach((slide, index) => {
          slide.classList.toggle("is-active", index === active);
        });
        dots.forEach((dot, index) => {
          dot.classList.toggle("is-active", index === active);
        });
      }

      function next() {
        active = (active + 1) % slides.length;
        render();
      }

      function prev() {
        active = (active - 1 + slides.length) % slides.length;
        render();
      }

      function stopAuto() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      function startAuto() {
        if (!timer) timer = setInterval(next, 5000 + sliderIndex * 200);
      }

      function restart() {
        stopAuto();
        startAuto();
      }

      prevBtn.addEventListener("click", () => {
        prev();
        restart();
      });
      nextBtn.addEventListener("click", () => {
        next();
        restart();
      });

      slider.addEventListener("mouseenter", stopAuto);
      slider.addEventListener("mouseleave", startAuto);
      slider.addEventListener("focusin", stopAuto);
      slider.addEventListener("focusout", startAuto);

      render();
      startAuto();
    });
  }

  function initProductWhatsAppButtons() {
    const buttons = document.querySelectorAll(".whatsapp-product-btn");
    buttons.forEach((button) => {
      const productName = button.dataset.product || "paper cutting scissors";
      const msg = `Assalam-o-Alaikum, I am interested in the ${productName} from Fan Deals Online Store. Please share its price and availability.`;
      button.href = encodeWhatsAppMessage(msg);
      button.target = "_blank";
      button.rel = "noopener";
    });
  }

  function initBackToTop() {
    const backToTop = document.getElementById("back-to-top");
    const footerTopLink = document.getElementById("footer-top-link");
    const yearEl = document.getElementById("year");

    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    function onScroll() {
      if (!backToTop) return;
      backToTop.classList.toggle("show", window.scrollY > 300);
    }

    window.addEventListener("scroll", onScroll);
    onScroll();

    if (backToTop) {
      backToTop.addEventListener("click", () => {
        document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
      });
    }

    if (footerTopLink) {
      footerTopLink.addEventListener("click", () => {
        document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  function initRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");
    if (!revealElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => observer.observe(el));
  }

  function initReviewCounters() {
    const section = document.getElementById("review-stats");
    if (!section) return;
    const counters = section.querySelectorAll(".counter");
    let started = false;

    const animateCounter = (counter) => {
      const target = Number(counter.dataset.target || "0");
      const decimals = Number(counter.dataset.decimals || "0");
      const suffix = counter.dataset.suffix || "";
      const duration = 1400;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = target * progress;
        counter.textContent = `${value.toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          counters.forEach(animateCounter);
        }
      });
    }, { threshold: 0.25 });

    observer.observe(section);
  }

  initNav();
  initSearch();
  initProductSliders();
  initProductWhatsAppButtons();

  document.querySelectorAll('a[href*="wa.me"]').forEach(btn => {
  btn.addEventListener('click', function() {
    fbq('track', 'Lead');
  });
});
  initBackToTop();
  initRevealAnimations();
  initReviewCounters();
})();
