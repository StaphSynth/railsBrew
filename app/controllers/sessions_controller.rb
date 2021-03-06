class SessionsController < ApplicationController
  def new
  end

  def create
    user = User.find_by(email: params[:session][:email].downcase)
    respond_to do |format|
      if(user && user.authenticate(params[:session][:password]))
        if(user.activated?)
          #log in
          log_in(user)
          #set extended session cookies according to user remembrance preferences
          params[:session][:remember_me] == '1' ? remember(user) : forget(user)
          #redirect to either the page the non-logged-in user was trying to access, or profile
          format.html { redirect_to req_url?(user), notice: "Welcome, #{user.name}!" }
        else
          format.html { redirect_to root_url, notice: "Account not activated. Please check your email for the activation link." }
        end
      else
        #show error
        format.html { redirect_to login_url, notice: "Email address/password incorrect. Please try again." }
      end
    end
  end

  def destroy
    log_out if logged_in?

    respond_to do |format|
      format.html { redirect_to root_url, notice: "You have successfully logged out" }
    end
  end
end
