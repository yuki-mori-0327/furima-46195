window.addEventListener('turbo:load', () => {
  const priceInput = document.getElementById("item-price");
  const addTaxDom  = document.getElementById("add-tax-price");
  const profitDom  = document.getElementById("profit");

  if (!priceInput) return;

  addTaxDom.textContent = "";
  profitDom.textContent = "";

  priceInput.addEventListener("input", () => {
    const inputValue = priceInput.value;

    if (inputValue === "") {
      addTaxDom.textContent = "";
      profitDom.textContent = "";
      return;
    }

    const price = Number(inputValue);
    if (Number.isNaN(price)) {
      addTaxDom.textContent = "";
      profitDom.textContent = "";
      return;
    }

    const tax = Math.floor(price * 0.1);
    addTaxDom.textContent = tax;
    profitDom.textContent = price - tax;
  });
});
