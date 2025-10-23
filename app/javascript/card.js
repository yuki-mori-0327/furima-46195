// app/javascript/card.js

const setupPay = () => {
  const form = document.getElementById("charge-form");
  if (!form || !window.Payjp) return;
  if (form.dataset.payjpBound === "true") return;
  form.dataset.payjpBound = "true";

  const payjp = Payjp();

  // === 有効期限（MM / YY）入力補助 ===
  const expiryInput = document.getElementById("card-expiry");
  if (expiryInput && expiryInput.dataset.bound !== "true") {
    expiryInput.dataset.bound = "true";

    expiryInput.addEventListener("input", (e) => {
      let v = e.target.value.replace(/[^\d]/g, ""); // 数字のみ

      // 1桁：2〜9なら 0 を付けて「MM / 」
      if (v.length === 1 && Number(v) > 1) {
        v = "0" + v + " / ";
      }
      // 2桁：そのまま「MM / 」
      else if (v.length === 2) {
        v = v + " / ";
      }
      // 3〜4桁：MMYY → 「MM / YY」
      else if (v.length > 2) {
        v = v.slice(0, 2) + " / " + v.slice(2, 4);
      }

      e.target.value = v.slice(0, 7); // 「MM / YY」まで
    });
  }

  // === 送信時のトークン化（あなたの既存処理） ===
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const rawExpiry = (fd.get("order_form[expiry]") || "").toString();
    const normalized = rawExpiry.replace(/[^\d]/g, "").slice(0, 6);

    let expMonth = "", expYear = "";
    if (normalized.length >= 4) {
      expMonth = normalized.slice(0, 2);
      expYear  = normalized.slice(2);
      if (expYear.length === 4) expYear = expYear.slice(2);
    }

    const card = {
      number: fd.get("order_form[number]"),
      cvc:    fd.get("order_form[cvc]"),
      exp_month: expMonth,
      exp_year:  expYear.length === 2 ? `20${expYear}` : expYear,
    };

    const monthOk = /^\d{2}$/.test(expMonth) && +expMonth >= 1 && +expMonth <= 12;
    const yearOk  = /^\d{2}$/.test(expYear);
    if (!card.number || !card.cvc || !monthOk || !yearOk) {
      alert("カード情報（番号・有効期限・CVC）を正しく入力してください");
      return;
    }

    try {
      const result = await payjp.createToken(card);
      if (result.error) {
        alert(result.error.message || "カードのトークン化に失敗しました。入力内容をご確認ください。");
        return;
      }

      form.insertAdjacentHTML("beforeend", `<input type="hidden" name="token" value="${result.id}">`);
      ["card-number", "card-expiry", "card-cvc"].forEach(id => document.getElementById(id)?.removeAttribute("name"));
      form.submit();
    } catch (err) {
      console.error(err);
      alert("通信に失敗しました。時間をおいて再度お試しください。");
    }
  });
};

document.addEventListener("turbo:load", setupPay);
document.addEventListener("turbo:render", setupPay);
