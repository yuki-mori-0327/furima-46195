class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.references :item, null: false, foreign_key: true, index: { unique: true } # 1商品は1回だけ購入

      t.timestamps
    end
  end
end
