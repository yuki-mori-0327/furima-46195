import "@hotwired/turbo-rails"
import "controllers"
import "item_price"
import "card"

import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

function setupPriceCalc() {
  const input  = document.getElementById("item-price");
  const feeEl  = document.getElementById("add-tax-price");
  const profEl = document.getElementById("profit");
  if (!input || !feeEl || !profEl) return;

  const recalc = () => {
    const raw   = (input.value || "").replace(/,/g, "").trim();
    const price = Number(raw);
    const clear = () => { feeEl.textContent = ""; profEl.textContent = ""; };

    if (!Number.isFinite(price) || price < 300 || price > 9999999) return clear();

    const fee    = Math.floor(price * 0.10);
    const profit = price - fee;

    feeEl.textContent  = fee.toLocaleString();
    profEl.textContent = profit.toLocaleString();
  };

  input.addEventListener("input",  recalc);
  input.addEventListener("change", recalc);
  recalc();
}

document.addEventListener("turbo:load",       setupPriceCalc);
document.addEventListener("DOMContentLoaded", setupPriceCalc);
