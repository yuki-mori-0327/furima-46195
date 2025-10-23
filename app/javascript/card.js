// app/javascript/card.js

const bindExpiryMask = () => {
  const el = document.getElementById("card-expiry");
  if (!el || el.dataset.bound === "true") return;
  el.dataset.bound = "true";
  el.addEventListener("input", (e) => {
    let v = e.target.value.replace(/[^\d]/g, "");
    if (v.length === 1 && Number(v) > 1) v = "0" + v + " / ";
    else if (v.length === 2) v = v + " / ";
    else if (v.length > 2) v = v.slice(0, 2) + " / " + v.slice(2, 4);
    e.target.value = v.slice(0, 7);
  });
};

const setupPay = () => {
  bindExpiryMask();

  const form = document.getElementById("charge-form");
  if (!form) return;

  // 🔑 公開鍵を meta から取得して明示的に渡す
  const pub = document.querySelector('meta[name="payjp-public-key"]')?.content;
  if (!window.Payjp || !pub) return;     // ライブラリ未読込 or 鍵なしならトークン化はスキップ

  if (form.dataset.payjpBound === "true") return;
  form.dataset.payjpBound = "true";

  const payjp = Payjp(pub);               // ← ここがポイント（Payjp() ではなく Payjp(pub)）

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const raw  = String(fd.get("order_form[expiry]") || "");
    const norm = raw.replace(/[^\d]/g, "").slice(0, 6);

    let mm = "", yy = "";
    if (norm.length >= 4) {
      mm = norm.slice(0, 2);
      yy = norm.slice(2);
      if (yy.length === 4) yy = yy.slice(2);
    }

    const card = {
      number: fd.get("order_form[number]"),
      cvc:    fd.get("order_form[cvc]"),
      exp_month: mm,
      exp_year:  yy.length === 2 ? `20${yy}` : yy,
    };

    const monthOk = /^\d{2}$/.test(mm) && +mm >= 1 && +mm <= 12;
    const yearOk  = /^\d{2}$/.test(yy);
    if (!card.number || !card.cvc || !monthOk || !yearOk) {
      alert("カード情報（番号・有効期限・CVC）を正しく入力してください");
      return;
    }

    try {
      const result = await payjp.createToken(card);
      if (result.error) {
        alert(result.error.message || "カードのトークン化に失敗しました。");
        return;
      }
      form.insertAdjacentHTML("beforeend", `<input type="hidden" name="token" value="${result.id}">`);
      ["card-number","card-expiry","card-cvc"].forEach(id => document.getElementById(id)?.removeAttribute("name"));
      form.submit();
    } catch (err) {
      console.error(err);
      alert("通信に失敗しました。時間をおいて再度お試しください。");
    }
  });
};

document.addEventListener("turbo:load",   setupPay);
document.addEventListener("turbo:render", setupPay);
