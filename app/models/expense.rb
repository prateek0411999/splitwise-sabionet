class Expense < ApplicationRecord
  attr_accessor :sharer_ids, :custom_sharer_expenses

  belongs_to :payer, class_name: 'User'
  belongs_to :created_by, class_name: 'User'

  has_many :expense_sharers
  has_many :users, through: :expense_sharers
  has_many :items

  enum expense_type: {
    non_itemized: 0,
    itemized: 1
  }

  enum split_type: {
    equally: 0,
    unequally: 1
  }

  after_create :create_non_itemized_sharers, if: -> { non_itemized? }
  after_create :create_itemized_sharers, if: -> { itemized? }

  def create_non_itemized_sharers
    case split_type
    when 'equally'
      create_equally_split_sharers
    when 'unequally'
      create_unequally_split_sharers
    end
  end

  def create_itemized_sharers
    case split_type
    when 'equally'
      create_equally_split_sharers
    when 'unequally'
      create_unequally_split_sharers
    end
  end

  private

  def create_equally_split_sharers
    total_sharers = sharer_ids.count
    amount_per_sharer = total_amount / total_sharers
    sharer_ids.each do |user_id|
      self.expense_sharers.create(user_id: user_id, amount: amount_per_sharer )
    end
  end

  def create_unequally_split_sharers
    custom_sharer_expenses.each do |user_id, prct|
      amount = total_amount * (prct["percentage"].to_f / 100.to_f)
      expense_sharers.create(user_id: user_id, amount: amount)
    end
  end
end
