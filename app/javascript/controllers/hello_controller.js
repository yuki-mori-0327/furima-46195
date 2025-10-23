// app/javascript/controllers/credit_card_controller.js
import { Controller } from "@hotwired/stimulus";

/**
 * クレジットカード入力用 Stimulus Controller
 * - カード番号：4桁ごとにスペース挿入（数字のみ保持）
 * - 有効期限  ：MM/YY 1フィールド or 月/年 分割の両方に対応
 * - 期限切れ  ：現在の年月より前なら赤表示（.is-invalid 付与）＆メッセージ表示
 * - CVC       ：数字のみ（最大4桁）
 *
 * 必要ターゲット（どれか存在すればOK）:
 *  number, exp, expHint, expMonth, expYear, cvc
 *
 * 例（ビュー側）：
 * <div data-controller="credit-card">
 *   <%= f.text_field :number, data: { credit_card_target: "number" }, ... %>
 *   <input data-credit-card-target="exp" ... />
 *   <small data-credit-card-target="expHint"></small>
 *   または
 *   <%= f.text_field :exp_month, data: { credit_card_target: "expMonth" }, ... %>
 *   <%= f.text_field :exp_year,  data: { credit_card_target: "expYear"  }, ... %>
 * </div>
 */
export default class extends Controller {
  static targets = ["number", "exp", "expHint", "expMonth", "expYear", "cvc"];

  connect() {
    // カード番号：4桁ごとスペース
    if (this.hasNumberTarget) {
      this.numberTarget.addEventListener("input", () => {
        const digits = this.numberTarget.value.replace(/\D/g, "").slice(0, 19); // 19桁まで（AMEX等考慮）
        this.numberTarget.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
      });
    }

    // CVC：数字のみ（最大4桁）
    if (this.hasCvcTarget) {
      this.cvcTarget.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
      });
    }

    // A) MM/YY 単一フィールド対応
    if (this.hasExpTarget) {
      this.expTarget.addEventListener("input", () => {
        let v = this.expTarget.value.replace(/\D/g, "").slice(0, 4); // 数字最大4桁
        if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
        this.expTarget.value = v;
        this.#checkAndPaint(this.#parseMMYY(v));
      });
      this.expTarget.addEventListener("blur", () => this.#checkAndPaint(this.#parseMMYY(this.expTarget.value)));
    }

    // B) 月/年 分割フィールド対応
    if (this.hasExpMonthTarget && this.hasExpYearTarget) {
      const onBothChange = () => {
        // 2桁まで数字のみ
        this.expMonthTarget.value = this.expMonthTarget.value.replace(/\D/g, "").slice(0, 2);
        this.expYearTarget.value  = this.expYearTarget.value.replace(/\D/g, "").slice(0, 2);

        const mm = this.expMonthTarget.value;
        const yy = this.expYearTarget.value;

        this.#checkAndPaint(
          { mm: mm ? +mm : NaN, yy: yy ? +yy : NaN },
          [this.expMonthTarget, this.expYearTarget]
        );
      };
      ["input", "blur"].forEach(ev => {
        this.expMonthTarget.addEventListener(ev, onBothChange);
        this.expYearTarget.addEventListener(ev, onBothChange);
      });
    }
  }

  // --- 内部ヘルパー ---

  #parseMMYY(text) {
    const m = (text || "").match(/^(\d{2})\/?(\d{2})$/);
    return m ? { mm: +m[1], yy: +m[2] } : { mm: NaN, yy: NaN };
  }

  /**
   * 期限チェックして見た目反映
   * @param {{mm:number, yy:number}} param0
   * @param {HTMLElement[]} fields  デフォルトは単一 exp フィールド
   */
  #checkAndPaint({ mm, yy }, fields = [this.expTarget].filter(Boolean)) {
    const now   = new Date();
    const curYY = now.getFullYear() % 100; // 下2桁
    const curMM = now.getMonth() + 1;      // 1-12

    let msg = "";
    let invalid = false;

    if (Number.isNaN(mm) || Number.isNaN(yy)) {
      // 入力途中はエラーにしない（必要なら msg を出す）
      msg = fields.length === 1 ? "MM/YY 形式で入力" : "";
      invalid = false;
    } else if (mm < 1 || mm > 12) {
      msg = "月は01-12で入力";
      invalid = true;
    } else {
      // 当月末まで有効 → (yy, mm) の順序で比較
      const isPast = !(yy > curYY || (yy === curYY && mm >= curMM));
      invalid = isPast;
      msg = isPast ? "有効期限が現在より前です" : "";
    }

    // 見た目反映（赤文字/赤枠は .is-invalid にCSSを当てる）
    fields.forEach(el => el?.classList.toggle("is-invalid", invalid));

    if (this.hasExpHintTarget) {
      this.expHintTarget.textContent = msg;
      this.expHintTarget.classList.toggle("error", !!invalid);
    }
  }
}
