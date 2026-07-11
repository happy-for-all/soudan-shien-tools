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
    #    （例：shutil.copy('monitoring.html', 'dist/monitoring.html')）
    # ==========================================
    if os.path.exists('index.html'):
        shutil.copy('index.html', 'dist/index.html')
        print("✅ index.html を dist フォルダに正常にコピーしました。")
    else:
        print("❌ エラー: ルートディレクトリに index.html が見つかりません。")

if __name__ == "__main__":
    build()
