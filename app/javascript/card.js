// card.js（v2対応版）
const setupPay = () => {
  const form = document.getElementById("charge-form");
  if (!form || !window.Payjp) return;
  if (form.dataset.payjpBound === "true") return;
  form.dataset.payjpBound = "true";

  // v2 は Payjp() で初期化（<script data-key="..."> を付けておく）
  const payjp = Payjp();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const card = {
      number:    fd.get("order_form[number]"),
      cvc:       fd.get("order_form[cvc]"),
      exp_month: fd.get("order_form[exp_month]"),
      exp_year:  String(fd.get("order_form[exp_year]")).length === 2
                  ? `20${fd.get("order_form[exp_year]")}`
                  : fd.get("order_form[exp_year]"),
    };

    if (!card.number || !card.cvc || !card.exp_month || !card.exp_year) {
      alert("カード情報を入力してください");
      return;
    }

    try {
      const result = await payjp.createToken(card); // v2はPromise & result.error
      if (result.error) {
        alert(result.error.message || "カードのトークン化に失敗しました。入力内容をご確認ください。");
        return;
      }

      form.insertAdjacentHTML(
        "beforeend",
        `<input type="hidden" name="token" value="${result.id}">`
      );

      ["card-number","card-exp-month","card-exp-year","card-cvc"].forEach(id=>{
        document.getElementById(id)?.removeAttribute("name");
      });

      form.submit();
    } catch (err) {
      console.error(err);
      alert("通信に失敗しました。時間をおいて再度お試しください。");
    }
  }, { once: true });
};

document.addEventListener("turbo:load", setupPay);
document.addEventListener("turbo:render", setupPay);
