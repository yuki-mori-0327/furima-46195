require 'rails_helper'

RSpec.describe 'ユーザー新規登録', type: :system do
  before do
    @user = FactoryBot.build(:user)
  end

  context 'ユーザー新規登録ができるとき' do
    it '正しい情報を入力すればユーザー新規登録ができてトップページに移動する' do
      visit root_path
      expect(page).to have_content('新規登録')

      visit new_user_registration_path

      # textarea（idで指定）
      find('#nickname').set(@user.nickname)
      find('#last-name').set(@user.last_name)
      find('#first-name').set(@user.first_name)
      find('#last-name-kana').set(@user.last_name_kana)
      find('#first-name-kana').set(@user.first_name_kana)

      # input（idで指定）
      find('#email').set(@user.email)
      find('#password').set(@user.password)
      find('#password-confirmation').set(@user.password_confirmation)

      # select（idで指定）
      select '2000', from: 'user_birthday_1i'
      select '1',    from: 'user_birthday_2i'
      select '25',   from: 'user_birthday_3i'

      expect do
        find('input[name="commit"]').click
        expect(page).to have_current_path(root_path, wait: 5) # 遷移を待つ
      end.to change(User, :count).by(1)

      expect(page).to have_content('ログアウト')
      expect(page).to have_no_content('新規登録')
      expect(page).to have_no_content('ログイン')
    end
  end

  context 'ユーザー新規登録ができないとき' do
    it '空の情報ではユーザー新規登録ができずに新規登録ページへ戻ってくる' do
      visit new_user_registration_path

      expect do
        find('input[name="commit"]').click
        expect(page).to have_current_path(new_user_registration_path, wait: 5)
      end.not_to change(User, :count)
    end

    it '（バリデーションで制約をかけているため）制約外の情報ではユーザー新規登録ができずに新規登録ページへ戻ってくる' do
      visit new_user_registration_path

      # textarea（idで指定）
      find('#nickname').set('test')
      find('#last-name').set('hankaku')
      find('#first-name').set('hankaku')
      find('#last-name-kana').set('ひらがな')
      find('#first-name-kana').set('ひらがな')

      # input（idで指定）
      find('#email').set('＠なし')
      find('#password').set('漢字')
      find('#password-confirmation').set('漢字')

      select '2000', from: 'user_birthday_1i'
      select '1',    from: 'user_birthday_2i'
      select '25',   from: 'user_birthday_3i'

      expect do
        find('input[name="commit"]').click
        expect(page).to have_current_path(new_user_registration_path, wait: 5)
      end.not_to change(User, :count)
    end
  end
end
