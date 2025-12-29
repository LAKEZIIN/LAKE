export function openSongModal(song) {
  const modal = document.getElementById("song-modal");
  modal.classList.remove("hidden");

  document.getElementById("modal-title").textContent = song.title;
  document.getElementById("modal-artist").textContent = song.artist || "Artista desconhecido";

  const tabs = document.getElementById("instrument-tabs");
  const info = document.getElementById("instrument-info");

  tabs.innerHTML = "";
  info.innerHTML = "";

  if (!song.difficulty) {
    info.innerHTML = "<p>Dificuldades não disponíveis</p>";
    return;
  }

  Object.entries(song.difficulty).forEach(([instrument, level], i) => {
    const btn = document.createElement("button");
    btn.textContent = instrument.toUpperCase();
    btn.onclick = () => {
      info.innerHTML = `<p>${"★".repeat(level)}</p>`;
    };
    tabs.appendChild(btn);
    if (i === 0) btn.click();
  });
}

const modal = document.getElementById("song-modal");
document.querySelector(".modal-close").onclick = () => modal.classList.add("hidden");
modal.onclick = e => { if (e.target === modal) modal.classList.add("hidden"); };
