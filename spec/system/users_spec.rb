require 'rails_helper'

RSpec.describe 'ユーザー新規登録', type: :system do
  before do
    @user = FactoryBot.build(:user)
  end

  context 'ユーザー新規登録ができるとき' do
    it '正しい情報を入力すればユーザー新規登録ができてトップページに移動する' do
      # トップページに移動する
      visit root_path
      # トップページにサインアップページへ遷移するボタンがあることを確認する
      expect(page).to have_content('新規登録')

      # 新規登録ページへ移動する
      visit new_user_registration_path

      # ユーザー情報を入力する（id は new.html.erb と合わせる）
      fill_in 'nickname',              with: @user.nickname
      fill_in 'email',                 with: @user.email
      fill_in 'password',              with: @user.password
      fill_in 'password-confirmation', with: @user.password_confirmation
      fill_in 'last-name',             with: @user.last_name
      fill_in 'first-name',            with: @user.first_name
      fill_in 'last-name-kana',        with: @user.last_name_kana
      fill_in 'first-name-kana',       with: @user.first_name_kana

      # 生年月日
      select @user.birthday.year.to_s,  from: 'user_birthday_1i'
      select @user.birthday.month.to_s, from: 'user_birthday_2i'
      select @user.birthday.day.to_s,   from: 'user_birthday_3i'

      # サインアップボタンを押すとユーザーモデルのカウントが1上がることを確認する
      expect {
       find('input[name="commit"]').click
       save_and_open_page
      }.to change { User.count }.by(1)
      # トップページへ遷移する
      expect(current_path).to eq root_path

      # ログアウトボタンが表示されていることを確認する（クラス名はビューに合わせてね）
      expect(page).to have_content('ログアウト')

      # サインアップページ・ログインページへ遷移するボタンが表示されていないことを確認する
      expect(page).to have_no_content('新規登録')
      expect(page).to have_no_content('ログイン')
    end
  end

  context 'ユーザー新規登録ができないとき' do
    it '空の情報ではユーザー新規登録ができずに新規登録ページへ戻ってくる' do
      visit root_path
      expect(page).to have_content('新規登録')

      visit new_user_registration_path

      # 何も入力しない
      expect {
        find('input[name="commit"]').click
      }.not_to change { User.count }

      # new_user_registration_path にとどまる
      expect(current_path).to eq new_user_registration_path
    end

    it '（バリデーションで制約をかけているため）制約外の情報ではユーザー新規登録ができずに新規登録ページへ戻ってくる' do
      visit root_path
      expect(page).to have_content('新規登録')

      visit new_user_registration_path

      # わざと不正な値を入れる
      fill_in 'email',                 with: '＠なし'
      fill_in 'password',              with: '漢字'
      fill_in 'password-confirmation', with: '漢字'
      fill_in 'last-name',             with: 'hankaku'
      fill_in 'first-name',            with: 'hankaku'
      fill_in 'last-name-kana',        with: 'ひらがな'
      fill_in 'first-name-kana',       with: 'ひらがな'

      expect {
        find('input[name="commit"]').click
      }.not_to change { User.count }

      expect(current_path).to eq new_user_registration_path
    end
  end
end
