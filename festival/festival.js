import { loadFestivalSongs } from "./api/festivalSongs.js";
import { loadFestivalCosmetics } from "./api/festivalCosmetics.js";
import { loadFestivalPasses } from "./api/festivalPasses.js";
import { openSongModal } from "./components/modal.js";

// Inicializa tudo
loadFestivalSongs(openSongModal);
loadFestivalCosmetics();
loadFestivalPasses();
