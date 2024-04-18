Rails.application.routes.draw do
  

  devise_for :users
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  root to: "dashboard#index"
  get 'people/:id', to: 'static#person'

  resources :dashboard, only: [:index]
  resources :expenses, only: [:new, :create, :show]
end
