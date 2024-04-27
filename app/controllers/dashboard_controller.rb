class DashboardController < ApplicationController
  before_action :set_user, only: [:index, :show]

  def index
    @users = User.all
    calculate_totals
  end

  def show
    calculate_totals  if @user.present?
  end

  private

  def set_user
    @user = params[:id] ? User.find(params[:id]) : current_user
  end

  def calculate_totals

    @paid_expenses = @user.expenses
    @owing_expenses = @user.expense_sharers
    @owed_expenses = @user.associated_expense_sharers.includes(:user, :expense)
    @owing_expenses = @user.expense_sharers.includes(:expense)
  
    # Calculate total amount owed - lene
    @total_owed = @owed_expenses.sum(&:amount)
  
    # Calculate total amount owing - dene
    @total_owing = @owing_expenses.sum(&:amount) 
  
    # Calculate total balance
    @total_balance = 0.00
    @total_balance = @total_owed - @total_owing   if @total_owed.present? && @total_owing.present?
  
    # Group owed expenses by user
    @friends_who_owe = @owed_expenses.group_by { |expense_sharer| expense_sharer.user }
  
    # Group owing expenses by payer_id
    @friends_i_owe = @owing_expenses.group_by { |expense_sharer| expense_sharer.expense.payer }

  end
end
