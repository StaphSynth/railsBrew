class Recipe < ApplicationRecord
  belongs_to :user
  has_many :recipe_ingredients

  accepts_nested_attributes_for :recipe_ingredients,
                                :allow_destroy => true,
                                :reject_if => :all_blank
end