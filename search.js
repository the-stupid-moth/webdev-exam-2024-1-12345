const searchInput = document.getElementById("search-input");
const autocompleteList = document.getElementById("autocomplete-list");
const apiKey = "ea0cb7c7-758b-482c-a02f-5f6c15ccbab5";

// Автодополнение
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (query.length === 0) {
    autocompleteList.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?query=${query}&api_key=${apiKey}`);
    const suggestions = await response.json();

    autocompleteList.innerHTML = "";
    suggestions.forEach(suggestion => {
      const item = document.createElement("div");

      const lowerSuggestion = suggestion.toLowerCase();
      const queryLower = query.toLowerCase();
      const index = lowerSuggestion.indexOf(queryLower);

      if (index !== -1) {
        const before = suggestion.slice(0, index);
        const match = suggestion.slice(index, index + query.length);
        const after = suggestion.slice(index + query.length);
        item.innerHTML = `${before}<strong>${match}</strong>${after}`;
      } else {
        item.textContent = suggestion;
      }

      item.classList.add("autocomplete-item");

      item.addEventListener("click", () => {
        searchInput.value = suggestion;
        searchInput.focus();
        autocompleteList.innerHTML = "";
      });

      autocompleteList.appendChild(item);
    });
  } catch (error) {
    console.error("Ошибка автодополнения:", error);
  }
});

// Поиск по кнопке
document.getElementById("search-button").addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query.length === 0) return;

  productGrid.innerHTML = "";
  fetchProducts(currentSortOrder, query);
});
