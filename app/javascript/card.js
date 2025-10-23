// app/javascript/card.js

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
  // まず毎回マスクを付ける（Payjpの有無に関係なく）
  bindExpiryMask();

  const form = document.getElementById("charge-form");
  if (!form) return;

  // 公開鍵を <meta> から取得
  const pubKey = document.querySelector('meta[name="payjp-public-key"]')?.content;

  // Payjpライブラリ or 公開鍵が無ければ、入力補助だけ動かして終了
  if (!window.Payjp || !pubKey) return;

  if (form.dataset.payjpBound === "true") return;
  form.dataset.payjpBound = "true";

  // v2 は公開鍵を明示して初期化
  const payjp = Payjp(pubKey);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);

    // 有効期限の取り出し（"03 / 27", "0327", "03/2027" などを許容）
    const raw  = String(fd.get("order_form[expiry]") || "");
    const norm = raw.replace(/[^\d]/g, "").slice(0, 6);

    let mm = "", yy2 = "";
    if (norm.length >= 4) {
      mm  = norm.slice(0, 2);   // "03"
      yy2 = norm.slice(2);      // "27" or "2027"
      if (yy2.length === 4) yy2 = yy2.slice(2); // "2027" -> "27"
    }

    // v2 は型に厳密 → 数値で渡す
    const exp_month = Number(mm);           // 3, 11 ...
    const exp_year  = Number(`20${yy2}`);   // 2027

    const card = {
      number: String(fd.get("order_form[number]") || "").replace(/\s+/g, ""),
      cvc:    String(fd.get("order_form[cvc]")    || ""),
      exp_month,
      exp_year,
    };

    // 簡易バリデーション
    const monthOk = Number.isInteger(exp_month) && exp_month >= 1 && exp_month <= 12;
    const yearOk  = Number.isInteger(exp_year)  && exp_year >= 2000 && exp_year <= 2099;
    if (!card.number || !card.cvc || !monthOk || !yearOk) {
      alert("カード情報（番号・有効期限・CVC）を正しく入力してください");
      return;
    }

    try {
      // ★ v2 正式シグネチャ：第1引数に 'card'
      const result = await payjp.createToken('card', card);

      if (result?.error) {
        alert(result.error.message || "カードのトークン化に失敗しました。入力内容をご確認ください。");
        return;
      }

      // トークンを hidden で送る
      form.insertAdjacentHTML("beforeend", `<input type="hidden" name="token" value="${result.id}">`);

      // セキュリティ：カード情報は name を外して送らない
      ["card-number", "card-expiry", "card-cvc"].forEach(id => {
        document.getElementById(id)?.removeAttribute("name");
      });

      form.submit();
    } catch (err) {
      console.error(err);
      alert("通信に失敗しました。時間をおいて再度お試しください。");
    }
  });
};

// Turbo対応（遷移/再描画ごとに設定）
document.addEventListener("turbo:load",   setupPay);
document.addEventListener("turbo:render", setupPay);
