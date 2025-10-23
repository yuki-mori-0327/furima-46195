class AdminController < ApplicationController
  before_action :authenticate_user!

  def storage_fix
    @counts = ActiveStorage::Blob.group(:service_name).count
    render plain: @counts.inspect  # とりあえず動作確認用
  end

  def storage_copy
    system("bin/rails active_storage:copy --source local --destination amazon")
    redirect_to admin_storage_fix_path, notice: "コピーを実行しました"
  end

  def storage_switch
    ActiveStorage::Blob.where(service_name: "local").in_batches.update_all(service_name: "amazon")
    redirect_to admin_storage_fix_path, notice: "service_name を local→amazon に更新しました"
  end

  private

  def ensure_admin!
    head :forbidden unless current_user&.respond_to?(:admin?) && current_user.admin?
  end
end
