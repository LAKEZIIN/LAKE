const API = "https://fortnite-api.com/v2/cosmetics/tracks";
const container = document.getElementById("songs-container");
const searchInput = document.getElementById("song-search");

let allSongs = [];
let renderedIds = new Set();
let page = 1;
const apiLimit = 50;
let isFetching = false;
let apiFinished = false;
let rowObserver;
let searchBuffer = null;

function openSongModal(song) {
  const modal = document.createElement("div");
  modal.className = "modal";

  function difficultySymbol(level) {
    if (!level) return "—";
    return "⬜".repeat(level) + "⬛".repeat(7 - level);
  }

  function formatAdded(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">✖</span>
      <img src="${song.albumArt}" alt="${song.title}">
      <h2>${song.title}</h2>
      <p class="artist">${song.artist || "Artista desconhecido"} — ${song.releaseYear || ""}</p>
      ${song.description ? `<p>${song.description}</p>` : ""}
      <h3><br>Dificuldades</h3>
      <p style="display: flex; justify-content: space-between;"><span>Vocal:</span><span>${difficultySymbol(song.difficulty?.vocals)}</span></p>
      <p style="display: flex; justify-content: space-between;"><span>Base:</span><span>${difficultySymbol(song.difficulty?.guitar)}</span></p>
      <p style="display: flex; justify-content: space-between;"><span>Baixo:</span><span>${difficultySymbol(song.difficulty?.bass)}</span></p>
      <p style="display: flex; justify-content: space-between;"><span>Bateria:</span><span>${difficultySymbol(song.difficulty?.drums)}</span></p>
      <p><br>Duração: ${song.duration || "-"}s<br>BPM: ${song.bpm || "—"}</p>
      ${song.genres ? `<p>Gêneros: ${song.genres.join(", ")}</p>` : ""}
      ${song.added ? `<p>Adicionado: ${formatAdded(song.added)}</p>` : ""}
    </div>
  `;

  modal.querySelector(".modal-close").onclick = () => modal.remove();
  modal.onclick = e => e.target === modal && modal.remove();

  document.body.appendChild(modal);
}

window.openSongModal = openSongModal;

async function fetchFromApi() {
  if (isFetching || apiFinished) return;
  isFetching = true;

  try {
    const res = await fetch(`${API}?page=${page}&limit=${apiLimit}`);
    const json = await res.json();

    const items = json.data || [];
    if (items.length < apiLimit) apiFinished = true;

    allSongs.push(...items);
    page++;
  } catch (e) {
    console.error("Erro ao buscar API de músicas:", e);
  } finally {
    isFetching = false;
  }
}

function getItemsPerRow() {
  const firstCard = container.querySelector(".song-card");
  if (!firstCard) return 1;
  const containerWidth = container.clientWidth;
  const cardWidth = firstCard.getBoundingClientRect().width;
  return Math.max(1, Math.floor(containerWidth / cardWidth));
}

function renderNextRows(list = null) {
  const songsList = list || (searchBuffer || allSongs);
  if (!songsList.length) return;

  const itemsPerRow = getItemsPerRow();
  const itemsToRender = itemsPerRow * 5;

  const fragment = document.createDocumentFragment();
  let renderedCount = 0;

  for (const song of songsList) {
    if (!song.id) continue;
    if (renderedIds.has(song.id)) continue;
    fragment.appendChild(createCard(song));
    renderedIds.add(song.id);
    renderedCount++;
    if (renderedCount >= itemsToRender) break;
  }

  container.appendChild(fragment);
  observeLastRow();
}

function createCard(song) {
  const card = document.createElement("div");
  card.className = "song-card fade-in";

  card.innerHTML = `
    <img src="${song.albumArt}" alt="${song.title}" loading="lazy">
    <div class="song-info">
      <h3>${song.title}</h3>
      <p class="artist">${song.artist || "Artista desconhecido"}</p>
    </div>
  `;

  card.addEventListener("click", () => openSongModal(song));
  return card;
}

function observeLastRow() {
  if (rowObserver) rowObserver.disconnect();

  const cards = container.querySelectorAll(".song-card");
  if (!cards.length) return;

  const lastCard = cards[cards.length - 1];

  rowObserver = new IntersectionObserver(
    async ([entry]) => {
      if (!entry.isIntersecting) return;

      if (!apiFinished) {
        await fetchFromApi();
      }
      renderNextRows(searchBuffer);
    },
    { rootMargin: "0px", threshold: 0.1 }
  );

  rowObserver.observe(lastCard);
}

function applySearch() {
  const search = searchInput.value.toLowerCase();

  searchBuffer = allSongs.filter(song => {
    return (
      song.title.toLowerCase().includes(search) ||
      (song.artist || "").toLowerCase().includes(search)
    );
  });

  renderedIds.clear();
  container.innerHTML = "";
  renderNextRows(searchBuffer);
}

searchInput.addEventListener("input", applySearch);

export async function loadFestivalSongs() {
  await fetchFromApi();
  renderNextRows();
}
