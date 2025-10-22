# config/puma.rb

max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }.to_i
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }.to_i
threads min_threads_count, max_threads_count

worker_timeout 3600 if ENV.fetch("RAILS_ENV", "development") == "development"

if ENV.fetch("RAILS_ENV", "development") == "development"
  ssl_bind "127.0.0.1", "3001",
           key:  "config/ssl/localhost-key.pem",
           cert: "config/ssl/localhost.pem",
           verify_mode: "none"
else
  port ENV.fetch("PORT", 3000)
end

environment ENV.fetch("RAILS_ENV") { "development" }
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }
plugin :tmp_restart
