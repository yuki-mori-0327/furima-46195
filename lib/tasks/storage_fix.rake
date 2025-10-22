# lib/tasks/storage_fix.rake
namespace :storage_fix do
  desc "Show count of blobs by service_name"
  task count: :environment do
    puts ActiveStorage::Blob.group(:service_name).count
  end

  desc "Copy local blobs to amazon"
  task copy: :environment do
    system("bin/rails active_storage:copy --source local --destination amazon")
  end

  desc "Change local blobs' service_name to amazon"
  task switch: :environment do
    ActiveStorage::Blob.where(service_name: "local").in_batches.update_all(service_name: "amazon")
    puts "✅ Updated service_name from local → amazon"
  end
end
