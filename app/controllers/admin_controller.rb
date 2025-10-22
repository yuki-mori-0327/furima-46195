class AdminController < ApplicationController
  # セキュリティ上、誰でも叩けないように念のため環境変数キーをチェック
  def storage_fix
    key = params[:key]
    return render plain: "unauthorized" unless key == ENV["STORAGE_FIX_KEY"]

    before = ActiveStorage::Blob.group(:service_name).count
    system("bin/rails active_storage:copy --source local --destination amazon")
    ActiveStorage::Blob.where(service_name: "local").in_batches.update_all(service_name: "amazon")
    after = ActiveStorage::Blob.group(:service_name).count

    render plain: "✅ Updated! before: #{before.inspect} / after: #{after.inspect}"
  end
end
