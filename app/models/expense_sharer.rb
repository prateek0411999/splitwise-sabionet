class ExpenseSharer < ApplicationRecord
  belongs_to :user
  belongs_to :expense
  belongs_to :item, optional: true
  
end
