// app/javascript/card.js

// ✅ PAY.JP v2 を importmap 経由で読み込む
import Payjp from "@payjp/payjs";

// --- 有効期限入力のマスク（Payjpに依存しないで常に動く） ---
const bindExpiryMask = () => {
  const el = document.getElementById("card-expiry");
  if (!el || el.dataset.bound === "true") return;
  el.dataset.bound = "true";

  el.addEventListener("input", (e) => {
    let v = e.target.value.replace(/[^\d]/g, ""); // 数字のみ
    if (v.length === 1 && Number(v) > 1) v = "0" + v + " / ";
    else if (v.length === 2)           v = v + " / ";
    else if (v.length > 2)             v = v.slice(0, 2) + " / " + v.slice(2, 4);
    e.target.value = v.slice(0, 7); // "MM / YY"
  });
};

// --- Payjp v2 トークン化設定 ---
const setupPay = () => {
  bindExpiryMask();

  const form = document.getElementById("charge-form");
  if (!form) return;

  const pubKey = document.querySelector('meta[name="payjp-public-key"]')?.content;
  if (!pubKey) {
    console.error("payjp-public-key が <meta> に設定されていません");
    return;
  }


  if (form.dataset.payjpBound === "true") return;
  form.dataset.payjpBound = "true";

  // ✅ import した Payjp をそのまま呼ぶ
  const payjp = Payjp(pubKey);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    // "03 / 27" / "0327" / "03/2027" などを許容
    const raw  = String(fd.get("order_form[expiry]") || "");
    const norm = raw.replace(/[^\d]/g, "").slice(0, 6);

    let mm = "", yy2 = "";
    if (norm.length >= 4) {
      mm  = norm.slice(0, 2);        // "03"
      yy2 = norm.slice(2);           // "27" or "2027"
      if (yy2.length === 4) yy2 = yy2.slice(2); // "2027" -> "27"
    }

    // ✅ ここを “文字列” に揃える（ゼロ埋め & 年は4桁）
    const exp_month = (mm  || "").padStart(2, "0");        // "03"
    const exp_year  = `20${(yy2 || "").padStart(2, "0")}`; // "2027"

    const card = {
      number: String(fd.get("order_form[number]") || "").replace(/\s+/g, ""),
      cvc:    String(fd.get("order_form[cvc]")    || ""),
      exp_month,
      exp_year,
    };

    console.log("DEBUG pubKey:", pubKey);
    console.log("DEBUG card:", card);

    // 簡易バリデーション
    const monthOk = /^\d{2}$/.test(exp_month) && +exp_month >= 1 && +exp_month <= 12;
    const yearOk  = /^\d{4}$/.test(exp_year)  && +exp_year  >= 2000 && +exp_year  <= 2099;
    if (!card.number || !card.cvc || !monthOk || !yearOk) {
      alert("カード情報（番号・有効期限・CVC）を正しく入力してください");
      return;
    }

    console.log("createToken args:", "card", card);

    try {
      // ✅ v2 のトークン化（生カードオブジェクト版）
      const result = await payjp.createToken("card", card);
      console.log("DEBUG result:", result);

      if (result?.error) {
        console.error(result.error);
        alert(result.error.message || "カードのトークン化に失敗しました。入力内容をご確認ください。");
        return;
      }

      // ✅ フォームに token を hidden で仕込む（OrderForm用）
      form.insertAdjacentHTML(
        "beforeend",
        `<input type="hidden" name="order_form[token]" value="${result.id}">`
      );

      // 実カード情報は送らないよう name を外す
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

document.addEventListener("turbo:load",   setupPay);
document.addEventListener("turbo:render", setupPay);
