class CreateExpenses < ActiveRecord::Migration[6.1]
  def change
    create_table :expenses do |t|
      t.string :description
      t.integer :payer_id
      t.float :total_amount
      t.integer :created_by_id
      t.integer :expense_type
      t.integer :split_type

      t.timestamps
    end
  end
end
