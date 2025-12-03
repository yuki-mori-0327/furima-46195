# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_item, only: [:index, :create]
  before_action :redirect_if_seller_or_sold, only: [:index, :create]

  def index
    @order_form = OrderForm.new
  end

  def create
    @order_form = OrderForm.new(order_params)
    Rails.logger.info "DEBUG order_form.token=#{@order_form.token.inspect}"

    if @order_form.valid?
      begin
        # 1) 決済（PayJP）
        pay_item(@item.price, @order_form.token)

        # 2) 購入情報の保存（OrderForm#save 内で Order / Address をまとめて保存）
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

  # ★OrderForm の attr_accessor と同じ名前にそろえる
  #   :postal_code / :addresses を使う
  def order_params
    params.require(:order_form)
          .permit(
            :postal_code, :prefecture_id, :city, :addresses,
            :building, :phone_number, :token
          )
          .merge(user_id: current_user.id, item_id: @item.id)
  end

  # token は @order_form.token を受け取って使う
  def pay_item(token, amount)
    # 開発環境では Pay.jp にリクエストしないならここで return
    return if Rails.env.development?

    Payjp.api_key = ENV.fetch('PAYJP_SECRET_KEY')

    Payjp::Charge.create(
      amount:   amount, # 商品の値段（整数）
      card:     token,  # JS で作ったトークン
      currency: 'jpy'
    )
  end

  def set_item
    @item = Item.find(params[:item_id])
  end

  def redirect_if_seller_or_sold
    redirect_to root_path if current_user.id == @item.user_id || @item.order.present?
  end
end
