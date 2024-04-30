class DashboardController < ApplicationController
  include DashboardHelper
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
    @current_user = current_user
    @user = params[:id] ? User.find(params[:id]) : @current_user
  end

  def calculate_totals
    @paid_expenses = @user.expenses.includes(expense_sharers: :item)
    @owed_expenses = @user.associated_expense_sharers.includes(:user, :expense)
    @owing_expenses = @user.expense_sharers.joins(expense: :payer).includes(:item, expense: :payer)

  
    # Calculate total amount owed - lene
    @total_owed = @owed_expenses.sum(:amount).presence || 0
  
    # Calculate total amount owing - dene
    @total_owing = @owing_expenses.sum(:amount).presence || 0
  
    # Calculate total balance
    @total_balance = 0.00
    @total_balance = @total_owed - @total_owing
  
    # Group owed expenses by user
    @friends_who_owe = @owed_expenses.group_by { |expense_sharer| expense_sharer.user }
  
    # Group owing expenses by payer_id
    @friends_i_owe = @owing_expenses.group_by { |expense_sharer| expense_sharer.expense.payer }

    @complete_activity = @paid_expenses + @owing_expenses
  end
end
