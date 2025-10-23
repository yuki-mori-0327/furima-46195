// 価格入力 → 手数料・利益を表示するロジックを関数にまとめる
const price = () => {
  const priceInput = document.getElementById("item-price");
  const taxSpan    = document.getElementById("add-tax-price");
  const profitSpan = document.getElementById("profit");
  if (!priceInput || !taxSpan || !profitSpan) return; // その画面に無ければ何もしない

  const render = () => {
    const raw   = priceInput.value.replace(/[^\d]/g, "");
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

  // 入力のたびに再計算
  priceInput.addEventListener("input", render);
  // 初期表示時も反映
  render();
};

// Turbo(=importmap標準)のページ表示/再描画イベントで実行
window.addEventListener("turbo:load",   price);
window.addEventListener("turbo:render", price);
