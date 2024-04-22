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

  def sharer_ids=(ids)
    ids.reject!(&:empty?) if ids.is_a?(Array)
    @sharer_ids = ids
  end

  def create_non_itemized_sharers
    case split_type
    when 'equally'
      create_equally_split_sharers
    when 'unequally'
      create_unequally_split_sharers
    end
  end

  private

  def amount_including_tax(amount)
    (amount + (amount * 0.245))
  end

  def create_sharer(user_id, amount)
    expense_sharers.create(user_id: user_id, amount: amount)
  end

  def create_item(description, amount, split_equally = nil, sharer = nil)
    equally_splitted = (split_equally.present? &&  split_equally== "on") ?  true : false
    items.create(description: description, amount: amount, split_equally: equally_splitted, user_id: sharer)
  end 

  def create_equally_split_sharers
    total_sharers = sharer_ids.count
    total_sharers = total_sharers + 1 #including the payer as splitting equally
    amount_per_sharer = total_amount / total_sharers
    sharer_ids.each do |user_id|
      create_sharer(user_id, amount_per_sharer&.round(2))
    end
  end

  def create_unequally_split_sharers
    custom_sharer_expenses.each do |user_id, prct|
      amount_per_sharer = total_amount * (prct["percentage"].to_f / 100.to_f)
      create_sharer(user_id, amount_per_sharer&.round(2))
    end
  end

  def create_itemized_sharers
    items = custom_sharer_expenses
    total_amount_sum = 0
    items.each do |item_hash|
      item_hash.each do |_, item_data|
        description = item_data["description"]
        amount = item_data['amount'].to_f
        split_equally = item_data["split_equally"]
        sharer = item_data["sharer"]&.to_i
        total_amount_sum += amount #updating the total_amount
        if split_equally.present? && split_equally == "on"
          # for now taxes are pre-defined so directly inputting the value
          total_sharers = sharer_ids.size + 1 #including the payerer
          amount_per_user_including_taxes = ((amount_including_tax(amount)) / total_sharers)
          sharer_ids.each do |user_id|
            create_sharer(user_id, amount_per_user_including_taxes)
          end
        else
          amount_with_tax_for_user = amount_including_tax(amount)
          create_sharer(sharer, amount_with_tax_for_user)
        end
        create_item(description, amount, split_equally, sharer)
      end
    end
    
    total_amount_sum_with_tax = amount_including_tax(total_amount_sum)
    self.update(total_amount: total_amount_sum_with_tax)
  end
end
