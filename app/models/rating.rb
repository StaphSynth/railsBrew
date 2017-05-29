class Rating < ApplicationRecord
  belongs_to :recipe
  belongs_to :user

  validates :rating, :numericality => {:greater_than => 0, :less_than_or_equal_to => 5}
  validates :user_id, :uniqueness => {:scope => :recipe_id}
end
