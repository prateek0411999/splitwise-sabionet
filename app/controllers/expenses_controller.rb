class ExpensesController < ApplicationController
  def new
    @expense = Expense.new
    @users = User.all
  end

  def create
    @expense = Expense.new(expense_params)
    @expense.created_by_id = current_user.id
    if @expense.save!
      return redirect_to dashboard_index_path, notice: "Expense has been created successfully."
    else
      render :new
    end
    
  end

  def show
    @expense = Expense.find(params[:id])
  end

  private
  def expense_params
    params.require(:expense).permit(:description, :expense_type, :payer_id, :total_amount, :split_type, sharer_ids: [])
  end
end
