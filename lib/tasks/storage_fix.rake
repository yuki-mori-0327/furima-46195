# lib/tasks/storage_fix.rake
namespace :storage_fix do
  desc 'Show count of blobs by service_name'
  task count: :environment do
    puts ActiveStorage::Blob.group(:service_name).count
  end

  desc 'Copy local blobs to amazon'
  task copy: :environment do
    system('bin/rails active_storage:copy --source local --destination amazon')
  end

  desc "Change local blobs' service_name to amazon"
  task switch: :environment do
    updated = 0

    ActiveStorage::Blob.where(service_name: 'local').find_each do |blob|
      blob.update!(service_name: 'amazon')
      updated += 1
    end

    puts "✅ Updated service_name from local → amazon (#{updated} blobs)"
  end
end
