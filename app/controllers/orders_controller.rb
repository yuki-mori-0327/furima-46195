# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_item
  before_action :redirect_if_seller_or_sold

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

        # 2) 購入情報の保存
        @order_form.save

        redirect_to root_path, notice: '購入が完了しました'
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
    # ★ token を permit に含めるのが超重要
    params.require(:order_form).permit(
      :postal_code, :prefecture_id, :city,
      :addresses, :building, :phone_number,
      :token
    ).merge(
      user_id: current_user.id,
      item_id: params[:item_id]
    )
  end

  def pay_item(amount, token)
    Payjp.api_key = ENV.fetch('PAYJP_SECRET_KEY')
    Payjp::Charge.create(
      amount: amount,
      card:   token,
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
