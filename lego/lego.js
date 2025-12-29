const API_KEY = "71eaa817-0f3a-42a6-b840-d75b078a3693";
const API_BASE = "https://fortnite-api.com/v2";

const API_HEADERS = {
  "Content-Type": "application/json",
  ...(API_KEY && { "Authorization": API_KEY })
};

const wiki = document.getElementById("wiki");
const searchInput = document.getElementById("searchInput");
const menuItems = document.querySelectorAll(".sidebar li");

let apiData = {};
let imageMap = {};
let currentSection = "";

fetch(`${API_BASE}/lego/items`, {
  headers: API_HEADERS
})
  .then(async res => {
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const text = await res.text();

    if (!text) {
      throw new Error("Resposta vazia da API");
    }

    return JSON.parse(text);
  })
  .then(json => {
    if (!json?.data) {
      throw new Error("JSON inválido");
    }

    json.data.forEach(item => {
      if (item.name && item.images?.icon) {
        imageMap[item.name.toLowerCase()] = item.images.icon;
      }
    });
  })
  .catch(err => {
    console.warn("Fortnite-API indisponível, usando fallback.", err);
  });

fetch("lego-api.json")
  .then(res => res.json())
  .then(data => {
    apiData = data;
    render();
  });

function getItemImage(item) {
  if (item.image) return `../${item.image}`;
  const apiImage = imageMap[item.title.toLowerCase()];
  if (apiImage) return apiImage;

  return "../assets/placeholder.png";
}

function render(filter = "") {
  wiki.innerHTML = "";

  Object.keys(apiData).forEach(section => {
    if (currentSection && section !== currentSection) return;

    const items = apiData[section].filter(item =>
      item.title.toLowerCase().includes(filter) ||
      item.desc.toLowerCase().includes(filter)
    );

    if (!items.length) return;

    wiki.innerHTML += `
      <div class="section">
        <h2>${section}</h2>
        <div class="cards">
          ${items.map(i => cardTemplate(i)).join("")}
        </div>
      </div>
    `;
  });

  document.querySelectorAll(".card").forEach(card => {
    card.onclick = () => {
      const item = JSON.parse(card.dataset.item);
      openModal(item);
    };
  });
}

function cardTemplate(item) {
  const img = getItemImage(item);

  return `
    <div class="card rarity-${item.rarity}" data-item='${JSON.stringify(item)}'>
      <img src="${img}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
    </div>
  `;
}

function openModal(item) {
  const img = getItemImage(item);

  const stats = item.stats
    ? Object.entries(item.stats)
        .map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`)
        .join("")
    : "";

  const drops = item.drops
    ? item.drops.map(d => `<li>${d}</li>`).join("")
    : "";

  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content rarity-${item.rarity}">
      <span class="modal-close">✖</span>
      <img src="${img}">
      <h2>${item.title}</h2>
      <p>${item.desc}</p>

      ${stats ? `<h3>📊 Stats</h3><ul>${stats}</ul>` : ""}
      ${drops ? `<h3>📦 Drops</h3><ul>${drops}</ul>` : ""}
    </div>
  `;

  modal.querySelector(".modal-close").onclick = () => modal.remove();
  modal.onclick = e => e.target === modal && modal.remove();

  document.body.appendChild(modal);
}

searchInput.addEventListener("input", e => {
  render(e.target.value.toLowerCase());
});

menuItems.forEach(item => {
  item.onclick = () => {
    currentSection = item.dataset.section;
    render(searchInput.value.toLowerCase());
  };
});
