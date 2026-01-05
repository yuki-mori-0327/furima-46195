FactoryBot.define do
  factory :item do
    association :user

    name { Faker::Name.name }
    explanation { Faker::Lorem.sentence }
    category_id { Faker::Number.between(from: 1, to: 10) }
    condition_id  { Faker::Number.between(from: 1, to: 6) }
    shipping_fee_status_id { Faker::Number.between(from: 1, to: 2) }
    prefecture_id { Faker::Number.between(from: 1, to: 47) }
    scheduled_delivery_id  { Faker::Number.between(from: 1, to: 3) }
    price { Faker::Number.between(from: 300, to: 9_999_999) }

  after(:build) do |item|
  item.image.attach(
    io: File.open(Rails.root.join('public/images/item-sample.png')),
    filename: 'item-sample.png'
  )
   end
  end
end

