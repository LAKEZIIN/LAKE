const COSMETICS_API = "https://fortnite-api.com/v2/cosmetics/br";

export async function loadFestivalCosmetics() {
  const res = await fetch(COSMETICS_API);
  const data = await res.json();

  const container = document.getElementById("cosmetics-container");
  container.innerHTML = "";

  data.data
    .filter(item => item.gameplayTags?.some(tag => tag.includes("Festival")))
    .forEach(item => {
      const card = document.createElement("div");
      card.className = "card fade-in";
      card.innerHTML = `
        <img src="${item.images.icon}" alt="${item.name}">
        <div class="card-content">
          <h3>${item.name}</h3>
          <p>${item.type.displayValue}</p>
        </div>
      `;
      container.appendChild(card);
    });
}
