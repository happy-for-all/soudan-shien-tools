import os
import shutil

# ==========================================
# 1. ビルド準備（distフォルダの初期化）
# ==========================================
def build():
    print("🚀 ビルドを開始します...")

    if os.path.exists('dist'):
        shutil.rmtree('dist')
    os.makedirs('dist')

    # ==========================================
    # 2. ファイルのコピー
    #    ツールが増えたら、ここに追記していく
    # ==========================================
    files_to_copy = ['index.html', 'style.css', 'script.js']
    for filename in files_to_copy:
        if os.path.exists(filename):
            shutil.copy(filename, f'dist/{filename}')
            print(f"✅ {filename} を dist フォルダに正常にコピーしました。")
        else:
            print(f"❌ エラー: ルートディレクトリに {filename} が見つかりません。")

if __name__ == "__main__":
    build()
