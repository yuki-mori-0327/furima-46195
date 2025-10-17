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

# ネイティブ拡張＆PGのビルドに必要 / アセット用に Node.js 必須
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git pkg-config \
      libpq-dev \
      nodejs \
      libvips && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# 依存を先に入れてキャッシュを効かせる
COPY Gemfile Gemfile.lock ./
# ※ lock に Linux プラットフォームが無い場合は事前にローカルで
#    `bundle lock --add-platform x86_64-linux` を実行しておく
RUN bundle install && \
    rm -rf ~/.bundle "$BUNDLE_PATH"/ruby/*/cache "$BUNDLE_PATH"/ruby/*/bundler/gems/*/.git && \
    bundle exec bootsnap precompile --gemfile

# アプリ本体
COPY . .

# Windows 改行対策 & bin 実行権限
# アプリ本体
COPY . .

# 改行(LF化)と実行権限付与を確実に
RUN set -eux; \
  if [ -d bin ]; then \
    find bin -maxdepth 1 -type f -exec sed -i 's/\r$//' {} \; ; \
    chmod -v 0755 bin/* || true; \
  fi

# bootsnap とアセットを build 時にプリコンパイル
RUN bundle exec bootsnap precompile app/ lib/ || true
RUN SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile

# ---------- Final stage ----------
FROM base

# ランタイムに必要なライブラリ（pg ランタイム / Node は一応残す）
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

# DB 準備の entrypoint（あなたのリポに合わせて）
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

EXPOSE 3000
# Puma でも rails server でもOK（Puma同梱）。puma 設定があるなら置換可。
CMD ["./bin/rails", "server"]
