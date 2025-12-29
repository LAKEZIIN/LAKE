const API_KEY = "71eaa817-0f3a-42a6-b840-d75b078a3693";
const API_BASE = "https://fortnite-api.com/v2";

const container = document.getElementById("skins-container");
const loading = document.getElementById("loading");
const counter = document.getElementById("counter");

const searchInput = document.getElementById("searchInput");
const rarityFilter = document.getElementById("rarityFilter");
const typeFilter = document.getElementById("typeFilter");
const themeToggle = document.getElementById("themeToggle");

const modal = document.getElementById("skinModal");
const closeModal = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalRarity = document.getElementById("modalRarity");
const modalDate = document.getElementById("modalDate");
const modalDesc = document.getElementById("modalDesc");
const favBtn = document.getElementById("favBtn");

let page = 1;
const apiLimit = 100;
let isFetching = false;
let apiFinished = false;

let buffer = [];
let filteredBuffer = null;
let renderedItems = [];
let currentItem = null;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function isValidItem(item) {
  const hasName = item?.name && item.name.trim() !== "" && item.name.toLowerCase() !== "tbd";

  const hasDescription =
    item?.description &&
    item.description.trim() !== "" &&
    item.description.toLowerCase() !== "null" &&
    item.description.toLowerCase() !== "tbd";

  const hasImage =
    (item?.images?.icon && item.images.icon.trim() !== "") ||
    (item?.images?.smallIcon && item.images.smallIcon.trim() !== "");

  return hasName && hasDescription && hasImage;
}


function formatDate(dateStr) {
  return dateStr ? dateStr.split("T")[0] : "N/A";
}

function getRarityClass(item) {
  if (!item.rarity) return "common";
  return (item.rarity.backendValue || "")
    .replace("EFortRarity::", "")
    .toLowerCase();
}

function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  themeToggle.textContent = theme === "light" ? "🌞" : "🌙";
}
applyTheme(localStorage.getItem("theme") || "dark");

themeToggle.addEventListener("click", () => {
  const theme = document.body.classList.contains("light") ? "dark" : "light";
  localStorage.setItem("theme", theme);
  applyTheme(theme);
});

async function fetchFromApi() {
  if (isFetching || apiFinished) return;

  isFetching = true;
  loading.style.display = "block";

  const language = "pt-BR";

  try {
    const res = await fetch(
      `${API_BASE}/cosmetics/br?page=${page}&limit=${apiLimit}&language=${language}`,
      { headers: { Authorization: API_KEY } }
    );
    const json = await res.json();
    const items = (json.data || []).filter(isValidItem);

    if (items.length < apiLimit) apiFinished = true;

    buffer.push(...items);
    page++;
  } catch (e) {
    console.error("Erro ao buscar API:", e);
  } finally {
    isFetching = false;
    loading.style.display = "none";
  }
}

function getItemsPerRow() {
  const firstCard = container.querySelector(".card");
  if (!firstCard) return 1;
  const containerWidth = container.clientWidth;
  const cardWidth = firstCard.getBoundingClientRect().width;
  return Math.max(1, Math.floor(containerWidth / cardWidth));
}

function renderNextRows() {
  if (buffer.length === 0) return;

  buffer = buffer.filter(isValidItem);

  const itemsPerRow = getItemsPerRow();
  const itemsToRender = itemsPerRow * 7;

  const fragment = document.createDocumentFragment();

  buffer.splice(0, itemsToRender).forEach(item => {
    renderedItems.push(item);
    fragment.appendChild(createCard(item));
  });

  container.appendChild(fragment);
  counter.textContent = `${renderedItems.length} itens carregados`;

  observeLastRow();
}


function createCard(item) {
  const card = document.createElement("div");
  card.className = "card fade-in";

  const img = item.images.smallIcon || item.images.icon;
  const rarityLabel = item.rarity?.displayValue || "";
  const rarityClass = getRarityClass(item);

  card.innerHTML = `
    <span class="rarity-badge ${rarityClass}">${rarityLabel}</span>
    <img src="${img}" loading="lazy" alt="${item.name}">
    <div class="card-content">
      <h3>${item.name}</h3>
      <p>${rarityLabel}</p>
    </div>
  `;

  card.addEventListener("click", () => openModal(item));
  return card;
}

function openModal(item) {
  currentItem = item;

  modalImg.src = item.images.icon || item.images.smallIcon;
  modalName.textContent = item.name;
  modalRarity.textContent = `Raridade: ${item.rarity?.displayValue || "N/A"}`;
  modalDate.textContent = `Lançamento: ${formatDate(item.added || item.releaseDate)}`;
  modalDesc.textContent = item.description;

  favBtn.textContent = favorites.includes(item.id)
    ? "⭐ Remover favorito"
    : "⭐ Favoritar";

  modal.classList.remove("hidden");

  let downloadBtn = document.getElementById("downloadAssetsBtn");
  if (!downloadBtn) {
    downloadBtn = document.createElement("button");
    downloadBtn.id = "downloadAssetsBtn";
    downloadBtn.textContent = "⬇️ Abrir todos os Assets";
    downloadBtn.style.marginTop = "10px";
    downloadBtn.style.padding = "8px 12px";
    downloadBtn.style.borderRadius = "6px";
    downloadBtn.style.cursor = "pointer";
    downloadBtn.style.border = "none";
    downloadBtn.style.backgroundColor = "var(--accent)";
    downloadBtn.style.color = "#fff";

    modal.querySelector(".modal-content").appendChild(downloadBtn);
  }

  downloadBtn.onclick = () => {
    const allAssets = getAllAssets(item);
    if (!allAssets.length) {
      alert("Nenhum asset disponível para este item.");
      return;
    }
    allAssets.forEach(url => window.open(url, "_blank"));
  };
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));

favBtn.addEventListener("click", e => {
  e.stopPropagation();
  if (!currentItem) return;

  const id = currentItem.id;
  favorites = favorites.includes(id)
    ? favorites.filter(f => f !== id)
    : [...favorites, id];

  localStorage.setItem("favorites", JSON.stringify(favorites));
  openModal(currentItem);
});

function applyFilters() {
  container.innerHTML = "";
  renderedItems = [];

  const search = searchInput.value.toLowerCase();
  const rarity = rarityFilter.value;
  const type = typeFilter.value;

  const filtered = buffer.filter(item => {
    if (!isValidItem(item)) return false;
    const matchName = item.name.toLowerCase().includes(search);
    const matchRarity = !rarity || item.rarity?.value === rarity;
    const matchType = !type || item.type?.value === type;
    return matchName && matchRarity && matchType;
  });

  buffer = filtered;
  renderNextRows();
}

searchInput.addEventListener("input", applyFilters);
rarityFilter.addEventListener("change", applyFilters);
typeFilter.addEventListener("change", applyFilters);

let rowObserver;

function observeLastRow() {
  if (rowObserver) rowObserver.disconnect();

  const cards = container.querySelectorAll(".card");
  if (!cards.length) return;

  const lastCard = cards[cards.length - 1];

  rowObserver = new IntersectionObserver(
    async ([entry]) => {
      if (!entry.isIntersecting) return;

      // Se houver filtro ativo, só renderiza o restante do filteredBuffer
      if ((!filteredBuffer || filteredBuffer.length < 20) && !apiFinished) {
        await fetchFromApi();
        if (!filteredBuffer) renderNextRows();
      } else {
        renderNextRows();
      }
    },
    { rootMargin: "0px", threshold: 0.1 }
  );

  rowObserver.observe(lastCard);
}

function getAllAssets(item) {
  const urls = [];

  function recurse(obj) {
    if (!obj) return;
    if (typeof obj === "string" && obj.startsWith("http")) {
      urls.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(v => recurse(v));
    } else if (typeof obj === "object") {
      Object.values(obj).forEach(v => recurse(v));
    }
  }

  recurse(item.images);
  if (item.variants) recurse(item.variants);

  return urls;
}

(async function init() {
  await fetchFromApi();
  renderNextRows();
})();
