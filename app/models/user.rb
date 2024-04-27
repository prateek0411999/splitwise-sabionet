class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :expense_sharers, dependent: :destroy
  has_many :expenses, foreign_key: 'payer_id', dependent: :destroy
  
  # Define the association to fetch all ExpenseSharer records associated with a user's expenses
  has_many :associated_expense_sharers, through: :expenses, source: :expense_sharers
end
