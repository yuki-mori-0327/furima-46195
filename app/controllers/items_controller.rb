# app/controllers/items_controller.rb
class ItemsController < ApplicationController
  before_action :authenticate_user!, only: %i[new create edit update]
  before_action :set_item, only: %i[show edit update]
  before_action :authorize_owner!, only: %i[edit update]
  before_action :forbid_when_sold!, only: %i[edit update]

  def index
    @items = Item.includes(:user).order(created_at: :desc)
  end

  def new
    @item = Item.new
  end

  def create
    @item = current_user.items.build(item_params)
    if @item.save
      redirect_to root_path, notice: '商品を出品しました'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @item.update(item_params)
      redirect_to @item, notice: '商品を更新しました'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def show
  end

  # def destroy
  # ログインしているユーザーと同一であればデータを削除する
  #   @item.destroy if @item.user_id == current_user.id
  #   redirect_to root_path
  #  end

  private

  def set_item
    @item = Item.find(params[:id])
  end

  def authorize_owner!
    return if current_user && @item.user_id == current_user.id

    redirect_to root_path, alert: '権限がありません'
  end

  def forbid_when_sold!
    redirect_to root_path, alert: '売却済み商品のため編集できません' if @item.respond_to?(:order) && @item.order.present?
  end

  def item_params
    params.require(:item).permit(
      :image, :name, :explanation, :price,
      :category_id, :condition_id,
      :shipping_fee_status_id, :prefecture_id, :scheduled_delivery_id
    )
  end
end
