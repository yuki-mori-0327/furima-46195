const setupPay = () => {
  const form = document.getElementById("charge-form");
  if (!form || !window.Payjp) return;
  if (form.dataset.payjpBound === "true") return;
  form.dataset.payjpBound = "true";

  const payjp = Payjp();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    // ---- 有効期限の解析（例: "03 / 27", "0327", "03/2027" などに対応）----
    const rawExpiry = (fd.get("order_form[expiry]") || "").toString();
    const normalized = rawExpiry.replace(/[^\d]/g, "").slice(0, 6);

    let expMonth = "";
    let expYear = "";

    if (normalized.length >= 4) {
      expMonth = normalized.slice(0, 2);
      expYear = normalized.slice(2);
      if (expYear.length === 4) expYear = expYear.slice(2); // 4桁→下2桁
    }

    // ---- カード情報の組み立て ----
    const card = {
      number: fd.get("order_form[number]"),
      cvc: fd.get("order_form[cvc]"),
      exp_month: expMonth,
      exp_year: expYear.length === 2 ? `20${expYear}` : expYear,
    };

    // ---- バリデーション ----
    const monthOk =
      /^\d{2}$/.test(expMonth) && Number(expMonth) >= 1 && Number(expMonth) <= 12;
    const yearOk = /^\d{2}$/.test(expYear);

    if (!card.number || !card.cvc || !monthOk || !yearOk) {
      alert("カード情報（番号・有効期限・CVC）を正しく入力してください");
      return;
    }

    try {
      const result = await payjp.createToken(card);
      if (result.error) {
        alert(
          result.error.message ||
            "カードのトークン化に失敗しました。入力内容をご確認ください。"
        );
        return;
      }

      // ---- トークンをフォームに追加 ----
      form.insertAdjacentHTML(
        "beforeend",
        `<input type="hidden" name="token" value="${result.id}">`
      );

      // ---- name属性を削除（カード情報をサーバーへ送らない）----
      ["card-number", "card-expiry", "card-cvc"].forEach((id) => {
        document.getElementById(id)?.removeAttribute("name");
      });

      form.submit();
    } catch (err) {
      console.error(err);
      alert("通信に失敗しました。時間をおいて再度お試しください。");
    }
  });
};

document.addEventListener("input", (e) => {
  const target = e.target;
  if (target.id !== "card-expiry") return;

  let v = target.value.replace(/[^\d]/g, ""); // 数字のみ
  if (v.length === 1 && Number(v) > 1) {
    v = "0" + v; // 例: 2 → 02
  }
  if (v.length > 2) {
    v = v.slice(0, 2) + " / " + v.slice(2, 4); // 例: 0227 → 02 / 27
  }
  target.value = v.slice(0, 7); // 最大 "MM / YY" 表記
});


document.addEventListener("turbo:load", setupPay);
document.addEventListener("turbo:render", setupPay);
