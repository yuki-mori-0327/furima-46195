// app/javascript/item_price.js
const price = () => {
  const priceInput = document.getElementById("item-price");
  const taxSpan    = document.getElementById("add-tax-price");
  const profitSpan = document.getElementById("profit");
  if (!priceInput || !taxSpan || !profitSpan) return;

  const render = () => {
    const raw   = (priceInput.value || "").replace(/[^\d]/g, "");
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      taxSpan.textContent = "";
      profitSpan.textContent = "";
      return;
    }
    const fee    = Math.floor(value * 0.1);
    const profit = value - fee;
    taxSpan.textContent    = fee.toLocaleString();
    profitSpan.textContent = profit.toLocaleString();
  };

  priceInput.addEventListener("input", render);
  render();
};

addEventListener("turbo:load",   price);
addEventListener("turbo:render", price);
