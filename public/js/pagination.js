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

// Function to fetch Pokémon and load it to HTML with style
const fetchPokemon = (page) => {
  const limit = 10;
  const offset = (page - 1) * limit;
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`)
    .then((resp) => resp.json())
    .then((respJSON) => {
      // Calculate the total number of pages available
      totalPages = Math.ceil(respJSON.count / limit);
      // Fetch details for each Pokémon to get their image
      const fetches = respJSON.results.map((pokemon) =>
        fetch(pokemon.url)
          .then((res) => res.json())
          .then((pokeData) => ({
            name: pokeData.name,
            image: pokeData.sprites.other["official-artwork"].front_default,
            // image: pokeData.sprites.other.home.front_default,
            // image: pokeData.sprites.front_default,
          }))
      );
      return Promise.all(fetches);
    })
    .then((pokemons) => {
      allPokemons = pokemons;
      filteredPokemons = pokemons; // Initialize filtered list
      renderPokemonList(pokemons);
      updatePagination();
    })
    .catch(console.error);
};

// Render Pokémon list
function renderPokemonList(pokemons) {
  result.innerHTML = "";
  pokemons.forEach((pokemon) => {
    result.innerHTML += `
      <div class="w-[230px] flex-row gap-4 items-center justify-center relative group">
        <img src="${pokemon.image}" class="transition-all duration-300 ease-in-out w-full h-auto" />
        <div class="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="font-light flex flex-col justify-center items-center">
          <div class="font-semibold text-center text-wrap capitalize">${pokemon.name}</div>
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

// Initial fetch
fetchPokemon(1);
