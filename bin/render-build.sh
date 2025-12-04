#!/usr/bin/env bash
# exit on error
set -o errexit

bundle install

# 本番アセットをビルド
bundle exec rails assets:precompile
bundle exec rails assets:clean
