class DashboardController < ApplicationController
  before_action :set_user, only: [:index, :show]

  def index
    @users = User.all
    fetch_user_expense_data
   
  end

  def show
    fetch_user_expense_data if @user.present?
  end

  private

  def set_user
    @user = params[:id] ? User.find(params[:id]) : current_user
  end

  def fetch_user_expense_data
    @user_expense_sharers = @user.expense_sharers
    @user_paid_expenses = @user.expenses
  end
end
