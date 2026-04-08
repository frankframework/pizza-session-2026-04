import JsBarcode from "https://cdn.jsdelivr.net/npm/jsbarcode@3.12.1/+esm";

const page = document.getElementById("page");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const resultsMeta = document.getElementById("results-meta");
const grid = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const modalCode = document.getElementById("modal-code");
const modalList = document.getElementById("modal-list");

const preferredFacts = [
  "energy-kcal_100g",
  "energy-kj_100g",
  "fat_100g",
  "saturated-fat_100g",
  "carbohydrates_100g",
  "sugars_100g",
  "fiber_100g",
  "proteins_100g",
  "salt_100g",
  "sodium_100g"
];

const formatLabel = (key) =>
  key.replace("_100g", "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value) => `${value} g`;

const buildFacts = (nutriments) =>
  preferredFacts
    .filter((key) => key in nutriments)
    .map((key) => `<li><span>${formatLabel(key)}</span><strong>${formatValue(nutriments[key])}</strong></li>`)
    .join("");

const openModal = (product) => {
  modalCode.textContent = `Code: ${product.code}`;
  modalList.innerHTML = buildFacts(product.nutriments);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};

const closeModal = () => {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
};

const render = (items) => {
  if (items.length === 0) {
    grid.innerHTML = `<p class="empty-state">No products found for this search.</p>`;
    return;
  }

  grid.innerHTML = items
    .map(
      (product) => `
      <article class="card" tabindex="0" data-code="${product.code}">
        <div class="card-inner">
          <div class="card-face card-front">
            <img src="${product.image_small_url}" alt="Product ${product.code}" loading="lazy" />
            <svg class="barcode" data-barcode="${product.code}" aria-label="Barcode ${product.code}"></svg>
          </div>
          <div class="card-face card-back">
            <h3>Nutrition per 100g</h3>
            <ul class="facts-list">${buildFacts(product.nutriments)}</ul>
          </div>
        </div>
      </article>`
    )
    .join("");

  grid.querySelectorAll(".barcode").forEach((barcode) => {
    JsBarcode(barcode, barcode.dataset.barcode, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      margin: 0,
      width: 1.5,
      height: 48
    });
  });

  grid.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const selected = items.find((p) => p.code === card.dataset.code);
      if (selected) {
        openModal(selected);
      }
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const selected = items.find((p) => p.code === card.dataset.code);
        if (selected) {
          openModal(selected);
        }
      }
    });
  });
};

const loadProducts = async (query) => {
  const normalized = query.trim();
  if (!normalized) {
    return [];
  }

  const response = await fetch(`/api/search/${encodeURIComponent(normalized)}`);
  if (!response.ok) {
    throw new Error(`Search request failed: ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
};

const showResults = async (query) => {
  const normalized = query.trim();

  page.classList.add("searched");
  if (!normalized) {
    render([]);
    resultsMeta.textContent = "Enter a search term to find products.";
    return;
  }

  resultsMeta.textContent = "Searching...";

  try {
    const foundProducts = await loadProducts(normalized);
    render(foundProducts);
    resultsMeta.textContent = `${foundProducts.length} result(s) for "${normalized}"`;
  } catch (error) {
    console.error(error);
    render([]);
    resultsMeta.textContent = "Search failed. Please try again.";
  }
};

const createFloatingBlocks = () => {
  const blocks = [
    {
      id: "block1",
      x: -400,
      y: -200,
      vx: 0.3 + Math.random() * 0.3,
      vy: 0.2 + Math.random() * 0.3,
      rotation: 25,
      rotationSpeed: 0.1,
      size: 750
    },
    {
      id: "block2",
      x: window.innerWidth - 200,
      y: -100,
      vx: -0.4 - Math.random() * 0.3,
      vy: 0.3 + Math.random() * 0.3,
      rotation: -15,
      rotationSpeed: -0.15,
      size: 600
    },
    {
      id: "block3",
      x: window.innerWidth - 300,
      y: window.innerHeight - 400,
      vx: 0.2 + Math.random() * 0.2,
      vy: -0.3 - Math.random() * 0.2,
      rotation: 45,
      rotationSpeed: 0.08,
      size: 850
    },
    {
      id: "block4",
      x: -300,
      y: window.innerHeight - 300,
      vx: -0.3 - Math.random() * 0.2,
      vy: -0.2 - Math.random() * 0.2,
      rotation: -30,
      rotationSpeed: -0.12,
      size: 700
    }
  ];

  const updateBlock = (block) => {
    block.x += block.vx;
    block.y += block.vy;
    block.rotation += block.rotationSpeed;

    if (block.x > window.innerWidth + 100) {
      block.x = -block.size - 100;
    }
    if (block.x < -block.size - 100) {
      block.x = window.innerWidth + 100;
    }
    if (block.y > window.innerHeight + 100) {
      block.y = -block.size - 100;
    }
    if (block.y < -block.size - 100) {
      block.y = window.innerHeight + 100;
    }

    const element = document.getElementById(block.id);
    if (element) {
      element.style.transform = `translate(${block.x}px, ${block.y}px) rotate(${block.rotation}deg)`;
    }
  };

  const placeBlocks = () => {
    blocks.forEach((block) => {
      const element = document.getElementById(block.id);
      if (element) {
        element.style.transform = `translate(${block.x}px, ${block.y}px) rotate(${block.rotation}deg)`;
      }
    });
  };

  const animate = () => {
    blocks.forEach(updateBlock);
    requestAnimationFrame(animate);
  };

  window.addEventListener("resize", () => {
    blocks.forEach((block) => {
      if (block.x > window.innerWidth) {
        block.x = window.innerWidth - block.size / 2;
      }
      if (block.y > window.innerHeight) {
        block.y = window.innerHeight - block.size / 2;
      }
    });
  });

  placeBlocks();
  animate();
};

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await showResults(searchInput.value);
});

createFloatingBlocks();
