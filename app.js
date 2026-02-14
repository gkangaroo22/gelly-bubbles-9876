const STORAGE_KEY = "nyc2026:v1:data";

const defaultData = {
  flights: {
    arrivalConfirmation: "",
    departureConfirmation: ""
  },
  events: {
    fri: {
      holywater: {
        title: "Holywater Dinner",
        details:
          "Birthday dinner with friends; reservation code placeholder <HOLYWATER_RES_CODE>; Party of 3; Lounge; dress polished casual."
      },
      barcrawl: {
        title: "Bar Crawl",
        details:
          "Suggested stops: Industry Bar (355 W 52nd St) OR Therapy (348 W 52nd St) start 8:45; Boxers HK (37th & 8th); Flaming Saddles (9th Ave); The Ritz (369 W 46th St) final ~10:30."
      }
    },
    sat: {
      basement: {
        title: "BASEMENT Afterparty",
        details: "Ticket placeholder: <BASEMENT_ORDER>. Travel: Uber/Lyft 25–30 min $25–35; leave 10:40 PM."
      }
    }
  },
  budget: {
    rows: [
      { id: crypto.randomUUID(), name: "Hilton Brooklyn (4 nights)", amount: 550 },
      { id: crypto.randomUUID(), name: "Dinner with Marissa & Grant", amount: 500 },
      { id: crypto.randomUUID(), name: "Birthday Dinner (Holywater)", amount: 200 },
      { id: crypto.randomUUID(), name: "Ailey Extension – Vogue", amount: 25 },
      { id: crypto.randomUUID(), name: "Broadway Dance Center – Vogue", amount: 25 },
      { id: crypto.randomUUID(), name: "MoMA Entry", amount: 30 },
      { id: crypto.randomUUID(), name: "NYC Ballet", amount: 75 },
      { id: crypto.randomUUID(), name: "Trip Outfit/Bag/Accessory", amount: 350 },
      { id: crypto.randomUUID(), name: "Friday Night (Bars + Nocturnal)", amount: 150 },
      { id: crypto.randomUUID(), name: "Saturday Night (BASEMENT)", amount: 200 }
    ]
  },
  pack: {
    checked: {}
  }
};

const packGroups = {
  "Grooming & Personal Care": [
    "Shave/groom",
    "Hair care products",
    "Skin care routine",
    "Deodorant",
    "Cologne/fragrance"
  ],
  "Health & Safety": [
    "Prescription medicine (3x daily doses for 4 days)",
    "Douche",
    "Condoms",
    "First aid basics",
    "Hand sanitizer"
  ],
  "Makeup & Beauty": [
    "Foundation/concealer",
    "Eye makeup",
    "Lip products",
    "Brushes/tools",
    "Makeup remover"
  ],
  Accessories: ["Jewelry", "Bags", "Boots", "Belt(s)", "Hat/cap"],
  Outfits: [
    "Friday dinner outfit",
    "Friday bar crawl/party outfit",
    "Saturday dance attire",
    "Saturday evening outfit (World Dweller)",
    "Saturday party outfit (BASEMENT)",
    "Sunday brunch casual",
    "Sunday ballet/dinner outfit",
    "Sunday night outfit (The Cock)",
    "Travel day outfit",
    "Extra underwear & socks",
    "Warm coat/jacket",
    "Layers"
  ],
  "Tech & Documents": [
    "Phone charger",
    "Portable battery pack",
    "Headphones",
    "ID/driver's license",
    "Credit cards & some cash",
    "Flight confirmations",
    "Hotel confirmation",
    "Event tickets"
  ],
  "Weather Essentials": ["Umbrella", "Warm layers", "Scarf", "Gloves", "Weather-appropriate shoes"],
  Entertainment: [
    "Download podcasts",
    "Gladness book on Apple Books",
    "Mini Metro game downloaded",
    "Tax law journal article",
    "Playlist downloaded offline"
  ]
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    return mergeDeep(structuredClone(defaultData), JSON.parse(raw));
  } catch {
    return structuredClone(defaultData);
  }
}

function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      target[key] = mergeDeep(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function vibrateLight() {
  if (navigator.vibrate) navigator.vibrate(10);
}

function activateTab(tabName) {
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tabTarget === tabName);
  });
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function setByPath(obj, path, value) {
  const keys = path.split(".");
  const leaf = keys.pop();
  const target = keys.reduce((acc, key) => {
    if (!acc[key]) acc[key] = {};
    return acc[key];
  }, obj);
  target[leaf] = value;
}

function initEditableFields() {
  document.querySelectorAll("[data-model]").forEach((input) => {
    input.value = getByPath(state, input.dataset.model) || "";
    input.addEventListener("input", () => {
      setByPath(state, input.dataset.model, input.value.trim());
      saveState();
    });
  });

  document.querySelectorAll("[data-editable]").forEach((el) => {
    const value = getByPath(state, el.dataset.editable);
    if (value) el.textContent = value;
    el.addEventListener("input", () => {
      setByPath(state, el.dataset.editable, el.textContent.trim());
      saveState();
    });
  });
}

function renderBudget() {
  const wrap = document.getElementById("budgetRows");
  wrap.innerHTML = "";

  state.budget.rows.forEach((row) => {
    const rowEl = document.createElement("div");
    rowEl.className = "budget-row";
    rowEl.innerHTML = `
      <input class="budget-name" value="${escapeHtml(row.name)}" aria-label="Expense name" />
      <input class="budget-amount" type="number" min="0" step="0.01" value="${Number(row.amount)}" aria-label="Expense amount" />
      <button class="btn danger" aria-label="Delete expense">Del</button>
    `;

    const [nameEl, amountEl, delBtn] = rowEl.children;
    nameEl.addEventListener("input", () => {
      row.name = nameEl.value;
      saveState();
    });
    amountEl.addEventListener("input", () => {
      row.amount = Number(amountEl.value || 0);
      updateBudgetTotal();
      saveState();
    });
    delBtn.addEventListener("click", () => {
      state.budget.rows = state.budget.rows.filter((r) => r.id !== row.id);
      renderBudget();
      saveState();
    });

    wrap.appendChild(rowEl);
  });

  updateBudgetTotal();
}

function updateBudgetTotal() {
  const total = state.budget.rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  document.getElementById("budgetTotal").textContent = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(total);
}

function renderPack() {
  const container = document.getElementById("packList");
  container.innerHTML = "";

  Object.entries(packGroups).forEach(([groupName, items]) => {
    const group = document.createElement("section");
    group.className = "card pack-group";
    group.innerHTML = `<h3>${groupName}</h3>`;

    items.forEach((item) => {
      const key = `${groupName}::${item}`;
      const checked = Boolean(state.pack.checked[key]);
      const row = document.createElement("label");
      row.className = "pack-item";
      row.innerHTML = `
        <input type="checkbox" ${checked ? "checked" : ""} data-pack-key="${escapeHtml(key)}" />
        <span>${item}</span>
      `;
      const checkbox = row.querySelector("input");
      checkbox.addEventListener("change", () => {
        state.pack.checked[key] = checkbox.checked;
        saveState();
        updatePackProgress();
      });
      group.appendChild(row);
    });

    container.appendChild(group);
  });

  updatePackProgress();
}

function updatePackProgress() {
  const boxes = Array.from(document.querySelectorAll("[data-pack-key]"));
  const done = boxes.filter((box) => box.checked).length;
  const total = boxes.length;
  const ratio = total ? (done / total) * 100 : 0;
  document.getElementById("packProgressBar").style.width = `${ratio}%`;
  document.getElementById("packProgressText").textContent = `${done} / ${total} packed`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const helper = document.createElement("textarea");
      helper.value = text;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    showToast("Copied");
    vibrateLight();
  } catch {
    showToast("Copy failed");
  }
}

function initUIEvents() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.tabTarget));
  });

  document.querySelectorAll("[data-action='ride']").forEach((btn) => {
    btn.addEventListener("click", () => window.open("https://m.uber.com", "_blank", "noopener"));
  });

  document.querySelectorAll("[data-action='go-tab']").forEach((btn) => {
    btn.addEventListener("click", () => activateTab(btn.dataset.targetTab));
  });

  document.querySelectorAll("[data-action='copy']").forEach((btn) => {
    btn.addEventListener("click", () => copyText(btn.dataset.copy));
  });

  document.querySelectorAll("[data-jump-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activateTab(btn.dataset.jumpTab);
      requestAnimationFrame(() => {
        document.getElementById(btn.dataset.jumpId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  });

  document.querySelectorAll(".collapse-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const parent = toggle.closest(".collapsible");
      const open = parent.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  });

  document.getElementById("addExpenseBtn").addEventListener("click", () => {
    state.budget.rows.push({ id: crypto.randomUUID(), name: "Custom expense", amount: 0 });
    renderBudget();
    saveState();
  });

  document.getElementById("resetDataBtn").addEventListener("click", () => {
    if (!window.confirm("Reset all locally saved trip edits, budget, and checklist data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(defaultData);
    initEditableFields();
    renderBudget();
    renderPack();
    saveState();
    showToast("Local data reset");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      showToast("Offline install unavailable");
    });
  }
}

function init() {
  initEditableFields();
  renderBudget();
  renderPack();
  initUIEvents();
  registerServiceWorker();
}

init();
