let allItems = [];
let currentFilter = "recent_works";

const CATEGORY_LABELS = {
  recent_works: "Recent Work",
  social_media_reels: "Social Media Reel",
  ae_works: "AE Work",
  pr_works: "PR Work",
};

async function loadGallery() {
  const grid = document.getElementById("grid");
  const { data, error } = await sb
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    grid.innerHTML = `<div class="empty-state">Could not load the gallery. Please try again shortly.</div>`;
    console.error(error);
    return;
  }

  allItems = data || [];
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById("grid");
  const items = allItems.filter((i) => i.category === currentFilter);

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-state">Nothing here yet — check back soon.</div>`;
    return;
  }

  grid.innerHTML = items.map((item, idx) => `
    <div class="card" onclick="openLightbox(${idx})" data-idx="${idx}">
      <div class="thumb-wrap">
        ${item.type === "video"
          ? `<video src="${item.url}" muted preload="metadata"></video>`
          : `<img src="${item.url}" alt="${escapeHtml(item.title || '')}" loading="lazy" />`
        }
      </div>
      <div class="meta">
        <div class="kind">${CATEGORY_LABELS[item.category] || item.type.toUpperCase()}</div>
        <h3>${escapeHtml(item.title || "Untitled")}</h3>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      </div>
    </div>
  `).join("");

  // Keep a filtered reference for the lightbox
  grid.dataset.rendered = JSON.stringify(items.map(i => i.id));
}

function setFilter(type) {
  currentFilter = type;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
  document.getElementById(`tab-${type}`).classList.add("active");
  renderGrid();
}

function openLightbox(idx) {
  const items = allItems.filter((i) => i.category === currentFilter);
  const item = items[idx];
  if (!item) return;

  const box = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");
  content.innerHTML = item.type === "video"
    ? `<video src="${item.url}" controls autoplay></video>`
    : `<img src="${item.url}" alt="${escapeHtml(item.title || '')}" />`;

  document.getElementById("lightbox-caption").textContent = item.title || "";
  box.classList.remove("hidden");
}

function closeLightbox() {
  document.getElementById("lightbox").classList.add("hidden");
  document.getElementById("lightbox-content").innerHTML = "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadGallery);
