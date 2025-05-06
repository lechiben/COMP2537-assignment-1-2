const fetchFavorites = () => {
  fetch("/favorites", { method: "GET" })
    .then((response) => response.json())
    .then(data => {
        const favoriteList= document.getElementById("favorite-list");
        favoriteList.innerHTML = ""; // clear the list before addning new
        data.forEach((favorite) => {
          const li = document.createElement("li");
          li.innerText = favorite.name;
          favoriteList.appendChild(li);
        });
    })
    .catch((error) => console.error("Error fetching favorites:", error));
}

