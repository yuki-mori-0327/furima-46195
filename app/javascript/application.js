import "@hotwired/turbo-rails"

import * as ActiveStorage from "@rails/activestorage"
ActiveStorage.start()

import "controllers"

function setupPriceCalc() {
  const input  = document.getElementById("item-price");
  const feeEl  = document.getElementById("add-tax-price");
  const profEl = document.getElementById("profit");
  if (!input || !feeEl || !profEl) return;

  // ✅ Turboで再実行されても1回だけ
  if (input.dataset.priceListener === "true") return;
  input.dataset.priceListener = "true";

  const recalc = () => {
    const raw   = (input.value || "").replace(/[^\d]/g, "");
    const price = Number(raw);

    // ✅ エラーハンドリング後も「毎回表示」させる（0を出す）
    if (!Number.isFinite(price) || price < 300 || price > 9_999_999) {
      feeEl.textContent  = "0";
      profEl.textContent = "0";
      return;
    }

    const fee    = Math.floor(price * 0.10);
    const profit = price - fee;

    feeEl.textContent  = fee.toLocaleString();
    profEl.textContent = profit.toLocaleString();
  };

  input.addEventListener("input", recalc);
  recalc();
}

// ✅ TurboだけでOK（DOMContentLoadedは不要＆重複の元）
document.addEventListener("turbo:load", setupPriceCalc);
document.addEventListener("turbo:render", setupPriceCalc);
