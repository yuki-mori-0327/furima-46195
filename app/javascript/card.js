const setupPay = () => {
  const form = document.getElementById("charge-form");
  if (!form || !window.Payjp) return;

  // <meta> から公開鍵を取得
  const meta = document.querySelector('meta[name="payjp-public-key"]');
  if (!meta || !meta.content) return;

  Payjp.setPublicKey(meta.content);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const card = {
      number:    fd.get("order_form[number]"),
      exp_month: fd.get("order_form[exp_month]"),
      exp_year:  `20${fd.get("order_form[exp_year]")}`,
      cvc:       fd.get("order_form[cvc]"),
    };

    Payjp.createToken(card, (status, response) => {
      if (status === 200) {
        form.insertAdjacentHTML(
          "beforeend",
          `<input type="hidden" name="token" value="${response.id}">`
        );
      }
      // name 属性を外す（カード情報は送らない）
      document.getElementById("card-number")?.removeAttribute("name");
      document.getElementById("card-exp-month")?.removeAttribute("name");
      document.getElementById("card-exp-year")?.removeAttribute("name");
      document.getElementById("card-cvc")?.removeAttribute("name");

      form.submit();
    });
  });
};

document.addEventListener("turbo:load", setupPay);
document.addEventListener("turbo:render", setupPay);
