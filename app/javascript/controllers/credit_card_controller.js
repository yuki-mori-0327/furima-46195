import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["numberElement", "expiryElement", "cvcElement"];

  connect() {
    // Turbo などで connect が複数回来ても壊れないようにする
    if (this.element.dataset.payjpMounted === "true") return;

    const meta = document.querySelector('meta[name="payjp-public-key"]');
    if (!meta) {
      console.error("payjp-public-key meta not found");
      return;
    }

    if (!window.Payjp) {
      console.error("Payjp JS not loaded");
      return;
    }

    const publicKey = meta.content;

    // ★ Payjp インスタンスは window に 1回だけ
    if (!window.payjpClient) {
      window.payjpClient = Payjp(publicKey);
    }
    this.payjp = window.payjpClient;

    // Elements 生成＆mount
    const elements = this.payjp.elements();
    this.cardNumber = elements.create("cardNumber");
    this.cardExpiry = elements.create("cardExpiry");
    this.cardCvc = elements.create("cardCvc");

    this.cardNumber.mount("#card-number");
    this.cardExpiry.mount("#card-expiry");
    this.cardCvc.mount("#card-cvc");

    this.element.dataset.payjpMounted = "true";

    // フォーム submit を 1回だけ bind
    const form = document.getElementById("charge-form");
    if (!form) {
      console.error("#charge-form not found");
      return;
    }
    if (form.dataset.payjpBound === "true") return;

    form.addEventListener("submit", this.handleSubmit.bind(this));
    form.dataset.payjpBound = "true";
  }

  async handleSubmit(event) {
    const tokenInput = document.getElementById("card-token");

    // ★ ここで落ちてたのでガードする
    if (!tokenInput) {
      console.error("#card-token not found (hidden field id mismatch?)");
      // tokenが無いならRails側バリデーションに任せて普通に送る
      return;
    }

    // すでに token が入ってるなら二重送信防止で何もしない
    if (tokenInput.value) return;

    // token 作ってから送るので一旦止める
    event.preventDefault();

    try {
      const result = await this.payjp.createToken(this.cardNumber);

      // ★ JSでは表示しない（Rails側のエラーに寄せる）
      if (result.error) {
        // tokenは空のまま送る → Railsで「Token can't be blank」などを出す
        event.target.submit();
        return;
      }

      tokenInput.value = result.id;
      event.target.submit();
    } catch (e) {
      console.error("Payjp createToken error:", e);
      // 例外時もRailsに寄せる（token空で送る）
      event.target.submit();
    }
  }
}
