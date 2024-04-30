class CreateExpenseSharers < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_sharers do |t|
      t.references :user, null: false, foreign_key: true
      t.references :expense, null: false, foreign_key: true
      t.float :amount
      t.integer :item_id

      t.timestamps
    end
  end
end
