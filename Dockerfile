# syntax = docker/dockerfile:1

ARG RUBY_VERSION=3.2.0
FROM ruby:${RUBY_VERSION}-slim AS base
WORKDIR /rails

# 本番向け bundler 設定
ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT="development test"

# ---------- Build stage ----------
FROM base AS build

# ネイティブ拡張＆PGのビルドに必要 / アセット用に Node.js（importmapでも一部gemがnode検出する場合がある）
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git pkg-config \
      libpq-dev \
      nodejs \
      libvips && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# 依存を先に入れてキャッシュを効かせる
COPY Gemfile Gemfile.lock ./
# ※ 必要なら事前に `bundle lock --add-platform x86_64-linux`
RUN bundle install && \
    rm -rf ~/.bundle "$BUNDLE_PATH"/ruby/*/cache "$BUNDLE_PATH"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile || true

# アプリ本体
COPY . .

# Windows 改行対策 & bin 実行権限を確実に付与
RUN set -eux; \
  if [ -d bin ]; then \
    find bin -maxdepth 1 -type f -exec sed -i 's/\r$//' {} \; ; \
    chmod 0755 bin/* || true; \
  fi; \
  [ -f ./bin/docker-entrypoint ] && sed -i 's/\r$//' ./bin/docker-entrypoint || true; \
  [ -f ./bin/docker-entrypoint ] && chmod 0755 ./bin/docker-entrypoint || true

# bootsnap とアセットを build 時にプリコンパイル
RUN bundle exec bootsnap precompile app/ lib/ || true
# DB には実際には接続しない。Rails に adapter(postgresql) を教えるためだけのダミーURL
RUN SECRET_KEY_BASE_DUMMY=1 \
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dummy \
    bundle exec rails assets:precompile


# ---------- Final stage ----------
FROM base

# ランタイムに必要なライブラリ
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libpq5 \
      nodejs \
      libvips && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# 成果物コピー
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /rails /rails

# 非 root 実行
RUN useradd rails --create-home --shell /bin/bash && \
    mkdir -p db log storage tmp && \
    chown -R rails:rails db log storage tmp
USER rails:rails

# DB 準備の entrypoint（あなたのリポのスクリプト想定）
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

EXPOSE 3000
# Puma設定があるなら差し替え可。ここでは rails server を 0.0.0.0 で起動
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]
