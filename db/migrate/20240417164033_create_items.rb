class CreateItems < ActiveRecord::Migration[6.1]
  def change
    create_table :items do |t|
      t.string :description
      t.float :amount
      t.references :expense, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.boolean :split_equally

      t.timestamps
    end
  end
end
