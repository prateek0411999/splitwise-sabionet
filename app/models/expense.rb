class Expense < ApplicationRecord
  belongs_to :payer, class_name: 'User'
  belongs_to :created_by, class_name: 'User'

  has_many :expense_sharers
  has_many :users, through: :expense_sharers
  has_many :items
  
  enum type: {
    non_itemized: 0,
    itemized: 1
  }
end
