const PASSES_CONFIG = "./config/passes.json";

export async function loadFestivalPasses() {
  const passes = await fetch(PASSES_CONFIG).then(res => res.json());
  const container = document.getElementById("passes-container");
  container.innerHTML = "";

  passes.forEach(pass => {
    const card = document.createElement("div");
    card.className = "pass-card fade-in";
    card.innerHTML = `
      <img src="${pass.image}" alt="${pass.name}">
      <div class="pass-info">
        <h3>${pass.name}</h3>
        <p>${pass.price} V-Bucks</p>
        <p>${pass.rewards.length} recompensas</p>
      </div>
    `;

    card.addEventListener("click", () => openPassModal(pass));

    container.appendChild(card);
  });
}

function openPassModal(pass) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const freeItems = pass.rewards.filter(r => r.type === "free");
  const premiumItems = pass.rewards.filter(r => r.type === "premium");

  const renderItems = items => items.map(item => `
    <div class="item-card">
      <img src="${item.image}" alt="${item.name}">
      <p>${item.name}</p>
    </div>
  `).join("");

  modal.innerHTML = `
    <div class="modal-pass-content">
      <span class="modal-close">✖</span>
      <h2>${pass.name}</h2>

      <h3><br>Itens Gratuitos<br></h3>
      <div class="items-row">
        ${renderItems(freeItems)}
      </div>

      <h3><br>Itens Premium<br></h3>
      <div class="items-row">
        ${renderItems(premiumItems)}
      </div>
    </div>
  `;

  modal.querySelector(".modal-close").onclick = () => modal.remove();
  modal.onclick = e => e.target === modal && modal.remove();

  document.body.appendChild(modal);
}
