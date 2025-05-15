// public/js/pagination.js
document.addEventListener("DOMContentLoaded", function () {
  const resultsDiv = document.getElementById("result");
  const typeFilterBox = document.getElementById("type-filter-box");
  const paginationBox = document.getElementById("pagination-box");
  const searchInput = document.getElementById("search-input");
  const favoritesListElement =
    document.getElementById("favorites-list") ||
    document.getElementById("favorites-grid");

  const itemsPerPage = 12;
  let currentPage = 1;
  let allPokemon = [];
  let typeFilters = [];
  let filteredPokemon = [];
  let favorites = [];

  // Initialize by fetching all Pokémon
  fetchAllPokemon();

  // Add search event listener
  searchInput.addEventListener("input", function () {
    filterPokemon();
  });

  /**
   * Fetch all Pokémon data from the API
   */
  function fetchAllPokemon() {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1302")
      .then((response) => response.json())
      .then((data) => {
        allPokemon = data.results;
        filteredPokemon = [...allPokemon];

        // If user is logged in, fetch favorites
        if (favoritesListElement) {
          fetchUserFavorites();
        }

        renderPagination();
        loadPage(currentPage);
      })
      .catch((error) => {
        console.error("Error fetching Pokémon:", error);
        resultsDiv.innerHTML = `<p class="text-red-500 col-span-full">Error loading Pokémon data. Please try again later.</p>`;
      });
  }

  /**
   * Fetch user's favorites if logged in
   */
  function fetchUserFavorites() {
    fetch("/favorites")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }
        return response.json();
      })
      .then((data) => {
        favorites = data;
        console.log("Fetched favorites:", favorites); // Debug log to check if favorites are fetched
      })
      .catch((error) => {
        console.error("Error fetching favorites:", error);
      });
  }

  /**
   * Filter Pokémon based on search input
   */
  function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === "") {
      filteredPokemon = [...allPokemon];
    } else {
      filteredPokemon = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm),
      );
    }

    currentPage = 1;
    renderPagination();
    loadPage(currentPage);
  }

  /**
   * Render type filter buttons
   */
  function renderTypeFilters() {
    const types = ["Normal", "Fire", "Fighting", "Water", "Flying", "Grass", "Poison", "Electric", "Ground", "Psychic", "Rock", "Ice", "Bug", "Dragon", "Ghost", "Dark", "Steel", "Fairy", "Stellar"];
    const colours = ["bg-neutral-500", "bg-orange-600", "bg-red-400", "bg-blue-600", "bg-indigo-300", "bg-green-600", "bg-purple-800", "bg-yellow-300", "bg-amber-900", "bg-pink-600", "bg-stone-600", "bg-sky-300", "bg-lime-700", "bg-violet-950", "bg-fuchsia-950", "bg-neutral-950", "bg-slate-600", "bg-pink-300", "bg-yellow-200"];

    for (let i = 0; i < types.length; i++) {
      const typeButton = document.createElement("button");
      typeButton.textContent = types[i];
      typeButton.className = `px-3 py-1 border rounded-md text-white ${colours[i]}`;
      typeButton.addEventListener("click", () => {
        typeFilters.push(types[i].toLowerCase());
        console.log(typeFilters);
      });
      typeFilterBox.appendChild(typeButton);
    }
  }

  /**
   * Render pagination buttons
   */
  function renderPagination() {
    const totalPages = Math.ceil(filteredPokemon.length / itemsPerPage);
    paginationBox.innerHTML = "";

    // First button
    if (totalPages > 1) {
      const firstButton = document.createElement("button");
      firstButton.textContent = "First";
      firstButton.className =
        "px-3 py-1 border rounded-md " +
        (currentPage === 1
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-white hover:bg-gray-100");
      firstButton.disabled = currentPage === 1;
      firstButton.addEventListener("click", () => {
        loadPage(1);
      });
      paginationBox.appendChild(firstButton);
    }

    // Previous button
    if (totalPages > 1) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Previous";
      prevButton.className =
        "px-3 py-1 border rounded-md " +
        (currentPage === 1
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-white hover:bg-gray-100");
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          loadPage(currentPage - 1);
        }
      });
      paginationBox.appendChild(prevButton);
    }

    // Page buttons
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.className =
        "px-3 py-1 border rounded-md " +
        (i === currentPage
          ? "bg-blue-500 text-white"
          : "bg-white hover:bg-gray-100");
      pageButton.addEventListener("click", () => loadPage(i));
      paginationBox.appendChild(pageButton);
    }

    // Next button
    if (totalPages > 1) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.className =
        "px-3 py-1 border rounded-md " +
        (currentPage === totalPages
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-white hover:bg-gray-100");
      nextButton.disabled = currentPage === totalPages;
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          loadPage(currentPage + 1);
        }
      });
      paginationBox.appendChild(nextButton);
    }

    // Last button
    if (totalPages > 1) {
      const lastButton = document.createElement("button");
      lastButton.textContent = "Last";
      lastButton.className =
        "px-3 py-1 border rounded-md " +
        (currentPage === totalPages
          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
          : "bg-white hover:bg-gray-100");
      lastButton.disabled = currentPage === totalPages;
      lastButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          loadPage(totalPages);
        }
      });
      paginationBox.appendChild(lastButton);
    }
  }

  /**
   * Load a specific page of Pokémon
   */
  function loadPage(page) {
    currentPage = page;
    renderTypeFilters();
    renderPagination();

    resultsDiv.innerHTML = `<p class="text-gray-500 col-span-full text-center">Loading Pokémon...</p>`;

    const start = (page - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredPokemon.length);
    const pokemonToShow = filteredPokemon.slice(start, end);

    fetchPokemonDetails(pokemonToShow);
  }

  /**
   * Fetch detailed information for each Pokémon
   */
  function fetchPokemonDetails(pokemonList = filteredPokemon) {
    resultsDiv.innerHTML = "";

    // Check if we have a restricted list (for pagination) or need all
    const pokemonToFetch = pokemonList.slice(0, itemsPerPage);

    if (pokemonToFetch.length === 0) {
      resultsDiv.innerHTML = `<p class="text-gray-500 col-span-full text-center">No Pokémon found. Try a different search.</p>`;
      return;
    }

    // Create promises for each Pokémon detail fetch
    const fetchPromises = pokemonToFetch.map((pokemon) =>
      fetch(pokemon.url)
        .then((response) => response.json())
        .catch((error) => {
          console.error(`Error fetching details for ${pokemon.name}:`, error);
          return null; // Return null for failed requests
        })
    );

    // Wait for all fetches to complete
    Promise.all(fetchPromises)
      .then((pokemonDetails) => {
        // Filter out any null results (failed fetches)
        const validPokemonDetails = pokemonDetails.filter(
          (detail) => detail !== null
        );

        // Display each Pokémon card
        validPokemonDetails.forEach((pokemon) => {
          createPokemonCard(pokemon);
        });
      })
      .catch((error) => {
        console.error("Error fetching Pokémon details:", error);
        resultsDiv.innerHTML = `<p class="text-red-500 col-span-full text-center">Error loading Pokémon details. Please try again later.</p>`;
      });
  }

  /**
   * Create a card for a single Pokémon
   */
  function createPokemonCard(pokemon) {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-lg shadow-md overflow-hidden flex flex-col";
    card.dataset.pokemonId = pokemon.id;

    // Check if the user is logged in - we'll use the presence of session username in the HTML
    const userElement = document.querySelector(
      'h1[class*="text-3xl font-bold"]'
    );
    const isLoggedIn =
      userElement && userElement.textContent.includes("Welcome to");

    console.log("Is logged in:", isLoggedIn); // Debug log

    // Check if this Pokémon is already favorited
    const isFavorited =
      isLoggedIn &&
      favorites.some((fav) => parseInt(fav.pokemonId) === pokemon.id);

    // Get image URL - prefer front_default, fallback to official artwork
    const imageUrl =
      pokemon.sprites.front_default ||
      (pokemon.sprites.other &&
        pokemon.sprites.other["official-artwork"] &&
        pokemon.sprites.other["official-artwork"].front_default) ||
      "https://via.placeholder.com/96";

    // Create the card HTML
    const cardHTML = `
      <div class="relative">
        <img 
          src="${imageUrl}" 
          alt="${pokemon.name}" 
          class="w-full h-32 object-contain bg-gray-100"
        >
        ${
          isLoggedIn
            ? `
          <button class="favorite-btn absolute top-2 right-2 text-2xl ${
            isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-300"
          }" 
                  data-id="${pokemon.id}" 
                  data-name="${pokemon.name}"
                  data-image="${imageUrl}">
            ${isFavorited ? "♥" : "♡"}
          </button>
        `
            : ""
        }
      </div>
      <div class="p-3">
        <h3 class="font-bold text-lg capitalize">${pokemon.name}</h3>
        <div class="flex gap-1 mt-1">
          ${pokemon.types
            .map(
              (type) =>
                `<span class="px-2 py-1 text-xs rounded-full bg-gray-200">${type.type.name}</span>`
            )
            .join("")}
        </div>
      </div>
    `;

    card.innerHTML = cardHTML;

    // Add event listener to favorite button if user is logged in
    if (isLoggedIn) {
      const favoriteBtn = card.querySelector(".favorite-btn");
      if (favoriteBtn) {
        favoriteBtn.addEventListener("click", toggleFavorite);
      }
    }

    resultsDiv.appendChild(card);
  }

  /**
   * Toggle favorite status for a Pokémon
   */
  function toggleFavorite(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const pokemonId = button.dataset.id;
    const pokemonName = button.dataset.name;
    const imageUrl = button.dataset.image;
    const isFavorited = button.textContent.trim() === "♥";

    console.log("Toggle favorite:", {
      pokemonId,
      pokemonName,
      imageUrl,
      isFavorited,
    }); // Debug log

    if (isFavorited) {
      // Find the favorite ID
      const favorite = favorites.find(
        (fav) => parseInt(fav.pokemonId) === parseInt(pokemonId)
      );
      if (!favorite) return;

      // Remove from favorites
      fetch(`/favorites/${favorite._id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to remove favorite");
          }
          return response.json();
        })
        .then((data) => {
          // Update UI
          button.textContent = "♡";
          button.classList.remove("text-red-500");
          button.classList.add("text-gray-400", "hover:text-red-300");

          // Update local favorites list
          favorites = favorites.filter((fav) => fav._id !== favorite._id);

          // Refresh favorites list if it exists
          if (typeof window.fetchFavorites === "function") {
            window.fetchFavorites();
          }
        })
        .catch((error) => {
          console.error("Error removing favorite:", error);
          alert("Failed to remove from favorites. Please try again.");
        });
    } else {
      // Add to favorites
      fetch("/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pokemonId,
          name: pokemonName,
          imageUrl,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to add favorite");
          }
          return response.json();
        })
        .then((data) => {
          // Update UI
          button.textContent = "♥";
          button.classList.remove("text-gray-400", "hover:text-red-300");
          button.classList.add("text-red-500");

          // Update local favorites list
          favorites.push(data);

          // Refresh favorites list if it exists
          if (typeof window.fetchFavorites === "function") {
            window.fetchFavorites();
          }
        })
        .catch((error) => {
          console.error("Error adding favorite:", error);
          alert("Failed to add to favorites. Please try again.");
        });
    }
  }

  // Export some functions to global scope for other scripts to use
  window.fetchUserFavorites = fetchUserFavorites;
});
