(function () {
  const site = window.SITE;
  if (!site) return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  document.querySelectorAll("[data-link]").forEach((a) => {
    const href = site.links[a.dataset.link];
    if (href) a.href = href;
  });

  const emailLink = document.getElementById("email-link");
  emailLink.href = `mailto:${site.email}`;

  document.getElementById("year").textContent = new Date().getFullYear();

  const work = document.getElementById("work-list");
  site.work.forEach((job) => {
    const row = el("li", "reveal");
    const body = el("div");
    const title = el("h3", "", `${job.role} `);
    title.append(el("span", "", `· ${job.org}`));
    body.append(title);
    if (job.text) body.append(el("p", "", job.text));
    row.append(el("div", "when", job.when), body);
    work.append(row);
  });

  const gallery = document.getElementById("gallery-grid");
  const shots = site.gallery || [];
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxButtons = lightbox.querySelectorAll("button");
  let current = 0;
  let opener = null;

  const showShot = (index) => {
    current = (index + shots.length) % shots.length;
    const shot = shots[current];
    lightboxImg.src = shot.src;
    lightboxImg.alt = shot.alt;
    lightboxCaption.textContent = `${current + 1} / ${shots.length} · ${shot.alt}`;
  };

  const openLightbox = (index, tile) => {
    opener = tile;
    showShot(index);
    lightbox.hidden = false;
    document.body.classList.add("is-locked");
    lightbox.querySelector(".lb-close").focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove("is-locked");
    if (opener) opener.focus();
  };

  shots.forEach((shot, index) => {
    const tile = el("button", "shot reveal");
    tile.type = "button";
    tile.setAttribute("aria-label", `View larger: ${shot.alt}`);
    const img = el("img");
    img.src = shot.src;
    img.alt = shot.alt;
    img.loading = "lazy";
    img.decoding = "async";
    tile.append(img);
    tile.addEventListener("click", () => openLightbox(index, tile));
    gallery.append(tile);
  });

  lightbox.querySelector(".lb-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lb-prev").addEventListener("click", () => showShot(current - 1));
  lightbox.querySelector(".lb-next").addEventListener("click", () => showShot(current + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    else if (event.key === "ArrowLeft") showShot(current - 1);
    else if (event.key === "ArrowRight") showShot(current + 1);
    else if (event.key === "Tab") {
      const first = lightboxButtons[0];
      const last = lightboxButtons[lightboxButtons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const revealed = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealed.forEach((node) => node.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealed.forEach((node) => observer.observe(node));
})();
