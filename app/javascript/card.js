// app/javascript/card.js
const pay = () => {
  const publicKey = gon.PAYJP_PUBLIC_KEY || "<%= ENV['PAYJP_PUBLIC_KEY'] %>"; // gonを使う場合もOK
  Payjp.setPublicKey(publicKey);

  const form = document.getElementById("charge-form");
  if (!form) return; // フォームが無いページでは何もしない

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    const card = {
      number: formData.get("order_form[number]"),
      exp_month: formData.get("order_form[exp_month]"),
      exp_year: `20${formData.get("order_form[exp_year]")}`,
      cvc: formData.get("order_form[cvc]"),
    };

    Payjp.createToken(card, (status, response) => {
      if (status === 200) {
        const token = response.id;
        const tokenObj = `<input value=${token} name='token' type="hidden">`;
        form.insertAdjacentHTML("beforeend", tokenObj);
      }

      document.getElementById("card-number")?.removeAttribute("name");
      document.getElementById("card-exp-month")?.removeAttribute("name");
      document.getElementById("card-exp-year")?.removeAttribute("name");
      document.getElementById("card-cvc")?.removeAttribute("name");

      form.submit();
    });
  });
};

document.addEventListener("turbo:load", pay);
