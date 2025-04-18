const productGrid = document.getElementById("product-grid");
const sortOrderSelect = document.getElementById("sort-order");
const noProductsMessage = document.getElementById("no-products-message");
let myWishes = JSON.parse(localStorage.getItem('myWishes')) || [];

let currentSortOrder = "rating_desc";

// Уведомления
function showNotification(message, type = 'success') {
  const notificationElement = document.getElementById('notification');
  if (!notificationElement) return;

  notificationElement.textContent = message;
  notificationElement.classList.remove('hidden');
  notificationElement.classList.add('show');

  setTimeout(() => {
    notificationElement.classList.remove('show');
    notificationElement.classList.add('hidden');
  }, 3000);
}

// Получение "реальной" цены с учётом скидки
function getComparablePrice(product) {
  return product.discount_price !== null ? product.discount_price : product.actual_price;
}

// Отображение карточек
function renderProducts(products) {
  productGrid.innerHTML = "";

  if (!products || products.length === 0) {
    noProductsMessage.classList.remove("hidden");
    return;
  } else {
    noProductsMessage.classList.add("hidden");
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    const finalPrice = getComparablePrice(product);

    let discountHtml = "";
    if (product.discount_price) {
      const discountPercent = Math.floor(100 - (product.discount_price / product.actual_price) * 100);
      discountHtml = `<span class="product-discount">-${discountPercent}%</span>`;
    }

    productCard.innerHTML = `
      <img src="${product.image_url}" alt="${product.name}" class="product-image">
      <h2 class="product-name">${product.name}</h2>
      <div class="product-rating">
        <span class="rating-value">${product.rating.toFixed(1)}</span> 
        <span class="stars">
          ${"★".repeat(Math.floor(product.rating)) + "☆".repeat(5 - Math.floor(product.rating))}
        </span>
      </div>
      <div class="product-prices">
        <span class="product-price">${finalPrice} ₽</span>
        ${product.discount_price ? `<span class="product-old-price">${product.actual_price} ₽</span>` : ""}
        ${discountHtml}
      </div>
      <button class="product-button">Добавить в корзину</button>
    `;

    productCard.setAttribute('data-id', product.id);

    if (myWishes.includes(String(product.id))) {
      productCard.classList.add('product-card-selected');
    }

    productGrid.appendChild(productCard);

    const addButton = productCard.querySelector('.product-button');
    addButton.addEventListener('click', addToCart);
  });
}

// Загрузка всех товаров с сервера
async function fetchProducts(sortOrder = "rating_desc", query = "") {
  const API_URL = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=ea0cb7c7-758b-482c-a02f-5f6c15ccbab5${query ? `&query=${encodeURIComponent(query)}` : ""}`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (!Array.isArray(data)) {
      showNotification("Не удалось загрузить товары.", "error");
      return;
    }
    if (data.length === 0) {
      renderProducts([]); // покажет "Нет товаров..."
      return;
    }
    
    if (typeof sortOrder === "string") {
      if (sortOrder.includes("price")) {
        data.sort((a, b) => {
          const priceA = getComparablePrice(a);
          const priceB = getComparablePrice(b);
          return sortOrder === "price_asc" ? priceA - priceB : priceB - priceA;
        });
      } else if (sortOrder.includes("rating")) {
        data.sort((a, b) => {
          return sortOrder === "rating_asc" ? a.rating - b.rating : b.rating - a.rating;
        });
      }
    }

    renderProducts(data);
  } catch (error) {
    console.error(error);
    showNotification("Ошибка загрузки данных. Попробуйте снова.", "error");
  }
}

// Добавление в корзину
function addToCart(event) {
  const productCard = event.target.closest(".product-card");
  const productId = String(productCard.getAttribute('data-id'));

  if (myWishes.includes(productId)) return;

  myWishes.push(productId);
  localStorage.setItem('myWishes', JSON.stringify(myWishes));
  productCard.classList.add('product-card-selected');
}

// Сортировка
sortOrderSelect.addEventListener("change", () => {
  currentSortOrder = sortOrderSelect.value;
  fetchProducts(currentSortOrder, document.getElementById("search-input").value.trim());
});

// Первичная загрузка
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts(currentSortOrder);
});
