// Create aliases for ID pagination-box and result
const container = document.getElementById("pagination-box");
const result = document.getElementById("result");
const searchInput = document.getElementById("search-input");

// Declare variables
let currentPage = 1,
  totalPages = 0,
  pageStart = 1,
  maxPagesToShow = 10;
let allPokemons = [];
let filteredPokemons = [];
let userFavorites = [];
let isLoggedIn = false;

// Check login status
const checkLoginStatus = () => {
  fetch("/check-auth", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      isLoggedIn = data.isAuthenticated;
      if (isLoggedIn) {
        fetchFavorites();
      }
      // Check for pending favorite action from redirect
      const urlParams = new URLSearchParams(window.location.search);
      const pendingPokemon = urlParams.get("addFavorite");
      if (pendingPokemon && isLoggedIn) {
        const pokemon = JSON.parse(decodeURIComponent(pendingPokemon));
        addToFavorites(pokemon);
        // Clear query parameter
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    })
    .catch((error) => console.error("Error checking login status:", error));
};

// Function to fetch user's favorites
const fetchFavorites = () => {
  fetch("/favorites", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      userFavorites = data;
      const favoriteList = document.getElementById("favorites-list");
      if (favoriteList) {
        favoriteList.innerHTML = ""; // Clear the list
        data.forEach((favorite) => {
          const li = document.createElement("li");
          li.innerText = favorite.name;
          favoriteList.appendChild(li);
        });
      }
    })
    .catch((error) => console.error("Error fetching favorites:", error));
};

// Function to fetch Pokémon and load it to HTML with style
const fetchPokemon = (page) => {
  const limit = 10;
  const offset = (page - 1) * limit;
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
    .then((resp) => resp.json())
    .then((respJSON) => {
      // Calculate the total number of pages available
      totalPages = Math.ceil(respJSON.count / limit);
      // Fetch details for each Pokémon to get their image and ID
      const fetches = respJSON.results.map((pokemon) =>
        fetch(pokemon.url)
          .then((res) => res.json())
          .then((pokeData) => ({
            name: pokeData.name,
            image: pokeData.sprites.other["official-artwork"].front_default,
            id: pokeData.id,
          }))
      );
      return Promise.all(fetches);
    })
    .then((pokemons) => {
      allPokemons = pokemons;
      filteredPokemons = pokemons; // Initialize filtered list
      renderPokemonList(pokemons);
      updatePagination();
      if (isLoggedIn) {
        fetchFavorites(); // Fetch favorites to update button states
      }
    })
    .catch(console.error);
};

// Function to add Pokémon to favorites
const addToFavorites = (pokemon) => {
  if (!isLoggedIn) {
    // Redirect to login with Pokémon data
    const redirectUrl = `/login?redirect=${encodeURIComponent(
      window.location.pathname
    )}&addFavorite=${encodeURIComponent(JSON.stringify(pokemon))}`;
    window.location.href = redirectUrl;
    return;
  }
  fetch("/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: pokemon.name, pokemonId: pokemon.id }),
  })
    .then((response) => response.json())
    .then((favorites) => {
      userFavorites = favorites;
      fetchFavorites(); // Update favorites list
      renderPokemonList(filteredPokemons); // Re-render to update buttons
    })
    .catch((error) => console.error("Error adding favorite:", error));
};

// Function to remove Pokémon from favorites
const removeFromFavorites = (pokemonId) => {
  fetch("/favorites", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pokemonId }),
  })
    .then((response) => response.json())
    .then((favorites) => {
      userFavorites = favorites;
      fetchFavorites(); // Update favorites list
      renderPokemonList(filteredPokemons); // Re-render to update buttons
    })
    .catch((error) => console.error("Error removing favorite:", error));
};

// Render Pokémon list
function renderPokemonList(pokemons) {
  result.innerHTML = "";
  pokemons.forEach((pokemon) => {
    const isFavorite = userFavorites.some(
      (fav) => fav.pokemonId === pokemon.id
    );
    result.innerHTML += `
      <div class="w-[230px] flex-row gap-4 items-center justify-center relative group">
        <img src="${
          pokemon.image
        }" class="transition-all duration-300 ease-in-out w-full h-auto" />
        <div class="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="font-light flex flex-col justify-center items-center">
          <div class="font-semibold text-center text-wrap capitalize">${
            pokemon.name
          }</div>
          <button class="absolute bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-2 py-1 rounded-lg text-white ${
            isFavorite
              ? "bg-red-500 hover:bg-red-700"
              : "bg-blue-500 hover:bg-blue-700"
          }" onclick='${
      isFavorite
        ? `removeFromFavorites(${pokemon.id})`
        : `addToFavorites(${JSON.stringify(pokemon)})`
    }'>
            ${isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </button>
        </div>
      </div>
    `;
  });
}

// Search/filter function
searchInput.addEventListener("input", function () {
  const filter = searchInput.value.toLowerCase();
  filteredPokemons = allPokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(filter)
  );
  renderPokemonList(filteredPokemons);
});

// Function to create buttons
const createButton = (
  text,
  onClick,
  disabled = false,
  classes = "px-4 py-2 bg-red-500 text-white rounded-lg transition-all duration-300 hover:bg-black hover:text-white"
) => {
  const btn = document.createElement("button");
  btn.innerText = text;
  btn.className = classes;
  btn.disabled = disabled;
  btn.addEventListener("click", onClick);
  return btn;
};

// Function to create pagination
const createPagination = () => {
  container.innerHTML = "";

  // Create first button when page > 1
  if (currentPage > 1) {
    container.append(
      createButton("First", () => {
        currentPage = 1;
        pageStart = 1;
        fetchPokemon(currentPage);
      })
    );
  }

  // Create previous button when page > 1
  if (currentPage > 1) {
    container.append(
      createButton("Previous", () => {
        currentPage--;
        if (currentPage < pageStart) {
          pageStart = Math.max(1, currentPage - 4);
        }
        fetchPokemon(currentPage);
      })
    );
  }

  // Create page buttons (1-10)
  const pageEnd = Math.min(pageStart + maxPagesToShow - 1, totalPages);
  for (let i = pageStart; i <= pageEnd; i++) {
    container.append(
      createButton(
        i.toString(),
        () => {
          currentPage = i;
          if (i >= pageEnd - 1 && pageEnd < totalPages) {
            pageStart = Math.min(totalPages - maxPagesToShow + 1, i);
          }
          fetchPokemon(currentPage);
        },
        false,
        `px-4 py-2 ${
          currentPage === i
            ? "bg-blue-400 text-white"
            : "bg-gray-200 text-gray-700"
        } rounded-full hover:bg-blue-500 hover:text-white`
      )
    );
  }

  // Next button
  if (currentPage < totalPages) {
    container.append(
      createButton("Next", () => {
        currentPage++;
        if (currentPage > pageEnd) {
          pageStart = Math.min(totalPages - maxPagesToShow + 1, currentPage);
        }
        fetchPokemon(currentPage);
      })
    );
  }

  // Last button
  if (currentPage < totalPages) {
    container.append(
      createButton("Last", () => {
        currentPage = totalPages;
        pageStart = Math.max(1, totalPages - maxPagesToShow + 1);
        fetchPokemon(currentPage);
      })
    );
  }
};

// Update pagination
const updatePagination = () => createPagination();

// Expose functions to global scope for inline onclick
window.addToFavorites = addToFavorites;
window.removeFromFavorites = removeFromFavorites;

// Initial fetch
checkLoginStatus();
fetchPokemon(1);
