class Item < ApplicationRecord
  belongs_to :expense
  belongs_to :user, optional: true
end
