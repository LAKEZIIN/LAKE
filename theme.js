const themeToggle = document.getElementById("themeToggle");
const legoLogo = document.getElementById("legoLogo");
const festivalLogo = document.getElementById("festivalLogo");
const brLogo = document.getElementById("brLogo");
const stwLogo = document.getElementById("stwLogo");
const creativeLogo = document.getElementById("creativeLogo");
const odysseyLogo = document.getElementById("odysseyLogo");

function applyTheme(theme) {
  document.body.classList.remove("light", "dark");
  document.body.classList.add(theme);

  if (themeToggle) {
    themeToggle.textContent = theme === "light" ? "🌞" : "🌙";
  }

  if (legoLogo) {
    legoLogo.src = theme === "light"
      ? "../assets/lego-logo.svg"
      : "../assets/lego-logo-alt.svg";
  }

  if (festivalLogo) {
    festivalLogo.src = theme === "light"
      ? "../assets/festival-logo.svg"
      : "../assets/festival-logo-alt.svg";
  }

  if (brLogo) {
    brLogo.src = theme === "light"
      ? "../assets/br-logo.svg"
      : "../assets/br-logo-alt.svg";
  }

  if (stwLogo) {
    stwLogo.src = theme === "light"
      ? "../assets/stw-logo.svg"
      : "../assets/stw-logo-alt.svg";
  }

  if (creativeLogo) {
    creativeLogo.src = theme === "light"
      ? "../assets/creative-logo.svg"
      : "../assets/creative-logo-alt.svg";
  }

  if (odysseyLogo) {
    odysseyLogo.src = theme === "light"
      ? "../assets/lego-odyssey-logo.svg"
      : "../assets/lego-odyssey-logo.svg";
  }
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const newTheme = document.body.classList.contains("light") ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });
}