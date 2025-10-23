class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_item, only: [:index, :create]
  before_action :redirect_if_seller_or_sold, only: [:index, :create]

  def index
    @order_form = OrderForm.new
  end

  def create
    @order_form = OrderForm.new(order_params)

    if @order_form.valid?
      begin
        # 1) 決済（失敗したら以降実行しない）
        pay_item!(@item.price, @order_form.token)

        # 2) 保存（フォームオブジェクト側が transaction で create! している想定）
        if @order_form.save
          redirect_to root_path, notice: '購入が完了しました'
        else
          flash.now[:alert] = '保存に失敗しました。時間をおいて再度お試しください。'
          render :index, status: :unprocessable_entity
        end
      rescue Payjp::CardError, Payjp::InvalidRequestError, Payjp::APIError => e
        Rails.logger.error("[PAYJP] charge failed: #{e.class}: #{e.message}")
        flash.now[:alert] = '決済に失敗しました。カード情報をご確認ください。'
        render :index, status: :unprocessable_entity
      end
    else
      flash.now[:alert] = '入力内容を確認してください'
      render :index, status: :unprocessable_entity
    end
  end

  private

  def order_params
    # ★ここは必ず OrderForm/DB のカラム名に合わせること！
    # 例：postal_code / addresses / phone_number など
    params.require(:order_form)
          .permit(:postal_code, :prefecture_id, :city, :addresses, :building, :phone_number)
          .merge(user_id: current_user.id, item_id: @item.id, token: params[:token])
  end

  def pay_item!(amount, token)
    Payjp.api_key = ENV.fetch('PAYJP_SECRET_KEY')
    Payjp::Charge.create(
      amount: amount,
      card: token,
      currency: 'jpy',
      # 同一リクエストの二重送信対策（任意）
      idempotency_key: "order-#{@item.id}-user-#{current_user.id}"
    )
  end

  def set_item
    @item = Item.find(params[:item_id])
  end

  def redirect_if_seller_or_sold
    redirect_to root_path if current_user.id == @item.user_id || @item.order.present?
  end
end
