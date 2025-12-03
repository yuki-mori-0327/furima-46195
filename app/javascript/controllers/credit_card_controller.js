// app/javascript/controllers/credit_card_controller.js
import { Controller } from "@hotwired/stimulus";

// Pay.jp v2 Elements（cardNumber / cardExpiry / cardCvc 分割）
export default class extends Controller {
  static targets = ["numberElement", "expiryElement", "cvcElement", "cardError"];

  connect() {
    console.log("credit-card connected");

    // ===== ターゲット確認 =====
    console.log("hasNumberElementTarget:", this.hasNumberElementTarget);
    console.log("hasExpiryElementTarget:", this.hasExpiryElementTarget);
    console.log("hasCvcElementTarget:", this.hasCvcElementTarget);

    if (!this.hasNumberElementTarget ||
        !this.hasExpiryElementTarget ||
        !this.hasCvcElementTarget) {
      console.error("カード用ターゲットのどれかが見つかりません");
      return;
    }

    // ===== 公開鍵を meta から取得 =====
    const meta = document.querySelector('meta[name="payjp-public-key"]');
    if (!meta) {
      console.error("payjp-public-key meta not found");
      return;
    }
    const publicKey = meta.getAttribute("content");
    console.log("PAYJP public key:", publicKey);

    if (!window.Payjp) {
      console.error("Payjp JS not loaded");
      return;
    }

    const payjp = Payjp(publicKey);
    this.payjp = payjp;
    const elements = payjp.elements();

    // ===== Elements 作成 =====
    const numberElement = elements.create("cardNumber");
    const expiryElement = elements.create("cardExpiry");
    const cvcElement    = elements.create("cardCvc");

    this.numberElement = numberElement;
    this.expiryElement = expiryElement;
    this.cvcElement    = cvcElement;

    // ===== mount（セレクタ文字列で） =====
    const numberSelector = `#${this.numberElementTarget.id}`; // #card-number
    const expirySelector = `#${this.expiryElementTarget.id}`; // #card-expiry
    const cvcSelector    = `#${this.cvcElementTarget.id}`;    // #card-cvc

    console.log("mount selectors:", {
      numberSelector,
      expirySelector,
      cvcSelector,
    });

    try {
      numberElement.mount(numberSelector);
      expiryElement.mount(expirySelector);
      cvcElement.mount(cvcSelector);
      console.log("Payjp card elements mounted");
    } catch (e) {
      console.error("Payjp mount error:", e);
      return;
    }

    // どれかでエラーが出たらメッセージ表示
    const handleChange = (event) => {
      if (!this.hasCardErrorTarget) return;
      this.cardErrorTarget.textContent = event.error ? event.error.message : "";
    };
    numberElement.on("change", handleChange);
    expiryElement.on("change", handleChange);
    cvcElement.on("change", handleChange);

    // ===== フォーム submit =====
    const form = document.getElementById("charge-form");
    if (!form) {
      console.error("#charge-form が見つかりません");
      return;
    }
    form.addEventListener("submit", this.handleSubmit.bind(this));
  }

  async handleSubmit(event) {
    const tokenInput = document.getElementById("card-token");
    if (tokenInput && tokenInput.value) return; // 二重送信防止

    event.preventDefault();

    try {
      // 分割Elementの場合も、トークン作成は cardNumber 要素を渡す
      const result = await this.payjp.createToken(this.numberElement);
      console.log("payjp result:", result);

      if (result.error) {
        if (this.hasCardErrorTarget) {
          this.cardErrorTarget.textContent = result.error.message;
        } else {
          alert(result.error.message);
        }
        return;
      }

      const token = result.id;
      if (tokenInput) tokenInput.value = token;

      event.target.submit();
    } catch (e) {
      console.error("Payjp createToken error:", e);
      alert("カード決済通信でエラーが発生しました。時間をおいて再度お試しください。");
    }
  }
}
