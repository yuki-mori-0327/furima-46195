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
        # 1) 決済
        pay_item

        # 2) 保存
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

  # ✅ OrderForm の属性名に合わせる（postcode / block など）
  def order_params
    params.require(:order_form)
          .permit(:postcode, :prefecture_id, :city, :block, :building, :phone_number, :token)
          .merge(user_id: current_user.id, item_id: @item.id)
  end

  # ✅ token は @order_form.token から使う
  def pay_item
    Payjp.api_key = ENV.fetch('PAYJP_SECRET_KEY')

    Payjp::Charge.create(
      amount:   @item.price,        # 商品の値段
      card:     @order_form.token,  # JS で作ったトークン
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
