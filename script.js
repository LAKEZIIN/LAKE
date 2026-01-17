const API_KEY = "71eaa817-0f3a-42a6-b840-d75b078a3693";
const API_BASE = "https://fortnite-api.com/v2";

const chartBody = document.getElementById("chart-body");
const chartContainer = document.querySelector(".chart-container");
const downloadBtn = document.getElementById("downloadChart");

/* ================== FORMATAÇÃO DE NÚMEROS ================== */
function formatNumber(value) {
  if (value === null || value === undefined) return "0";

  const num = Number(String(value).replace(/[^\d]/g, ""));

  if (isNaN(num)) return value;

  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(".0", "") + "m";
  }

  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(".0", "") + "k";
  }

  return num.toString();
}

/* ================== UTIL ================== */
async function toBase64(url) {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    return await new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return "https://via.placeholder.com/50";
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return dateStr.split("T")[0];
}

/* ================== API ================== */
async function fetchSkinByName(name) {
  const url = `${API_BASE}/cosmetics/br/search?name=${encodeURIComponent(name)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

/* ================== RENDER ================== */
function renderChart(data) {
  const previous = JSON.parse(localStorage.getItem("previousChart")) || [];
  chartBody.innerHTML = "";

  data.forEach((artist, index) => {
    const lastIndex = previous.findIndex(p => p.name === artist.name);
    let diff = "●";
    let diffClass = "same";

    if (lastIndex !== -1) {
      if (lastIndex > index) {
        diff = "↑";
        diffClass = "up";
      } else if (lastIndex < index) {
        diff = "↓";
        diffClass = "down";
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="${diffClass}">${diff}</td>
      <td class="artist-name">
        <img class="artist-icon" src="${artist.icon}">
        ${artist.name}
      </td>
      <td>${formatNumber(artist.value)}</td>
      <td>${artist.date}</td>
    `;
    chartBody.appendChild(tr);
  });

  localStorage.setItem("previousChart", JSON.stringify(data));
}

/* ================== LOAD ================== */
async function loadChartFromAPI() {
  const res = await fetch("data.json");
  const list = await res.json();
  const data = [];

  for (const item of list) {
    const skin = await fetchSkinByName(item.name);
    const iconUrl = skin?.images?.icon || "https://via.placeholder.com/50";
    const iconBase64 = await toBase64(iconUrl);

    data.push({
      name: skin?.name || item.name,
      icon: iconBase64,
      date: formatDate(skin?.added || skin?.releaseDate),
      value: String(item.value).replace(/[^\d]/g, "")
    });
  }

  data.sort((a, b) => b.value - a.value);
  renderChart(data);
}

/* ================== DOWNLOAD PNG ================== */
downloadBtn.addEventListener("click", async () => {
  const images = chartContainer.querySelectorAll("img");

  await Promise.all(
    Array.from(images).map(img => {
      return new Promise(resolve => {
        if (img.complete) resolve();
        else img.onload = img.onerror = resolve;
      });
    })
  );

  html2canvas(chartContainer, {
    backgroundColor: "#f4f6fa",
    useCORS: true,
    scale: 2
  })
    .then(canvas => {
      const link = document.createElement("a");
      link.download = "chart.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    })
    .catch(err => console.error("Erro ao gerar PNG:", err));
});

/* ================== INIT ================== */
loadChartFromAPI();
