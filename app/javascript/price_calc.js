function setupPriceCalc() {
  const input  = document.getElementById("item-price");
  const feeEl  = document.getElementById("add-tax-price");
  const profEl = document.getElementById("profit");
  if (!input || !feeEl || !profEl) return;

  const recalc = () => {
    const raw   = (input.value || "").replace(/,/g, "").trim();
    const price = Number(raw);

    const clear = () => { feeEl.textContent = ""; profEl.textContent = ""; };

    // 空/数値じゃない or 範囲外は空表示
    if (!Number.isFinite(price) || price < 300 || price > 9999999) return clear();

    const fee    = Math.floor(price * 0.10); // 10%切り捨て
    const profit = price - fee;

    feeEl.textContent  = fee.toLocaleString();
    profEl.textContent = profit.toLocaleString();
  };

  input.addEventListener("input",  recalc);
  input.addEventListener("change", recalc);
  recalc(); // 初期表示
}

// Turbo対応（どちらかが発火）
document.addEventListener("turbo:load",       setupPriceCalc);
document.addEventListener("DOMContentLoaded", setupPriceCalc);
