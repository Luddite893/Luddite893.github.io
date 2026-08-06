# 図版生成の設定例
#
#   . src/art-env.example.sh        # 読み込む（ART_API_KEY は別に与える）
#   python3 src/gen-artwork.py --dry
#
# ── 鍵はここに書かない ────────────────────────────
# **この控えは版元に納める資料である。鍵を書けば、鍵が納品物になる。**
# 鍵は手元の環境変数で与える。履歴に残さないよう、行頭に空白を置くとよい。
#
#     export ART_API_KEY=…            ← この一行だけは、この控えの外で
#
# 万一どこかに書いてしまったら、書いた先を消すだけでは足りない。
# 発行元で鍵を作り直す。控えは残る。
#
# ── 業者ごとの違いは、この五つに収まる ──────────────
# gen-artwork.py は一社に決め打ちしていない。下の五つを与えれば足りる。

# ══════════════════════════════════════════════
# Google — Gemini 画像生成（generativelanguage.googleapis.com）
# ══════════════════════════════════════════════
# 縦横比が 5:4 と 2:3 をそのまま採れる。本書の主図版・人物図版と同じ比なので、
# 生成の後で切り落とす必要がない。これが決め手になる。
#
#   gemini-3-pro-image          最も精緻。線の彫りが安定する
#   gemini-3.1-flash-image      速く安い。量を通すときはこちら
#   gemini-2.5-flash-image      旧世代
#
# 【注意】無料枠では画像の生成は許されていない（limit: 0）。
# 鍵が正しくても 429 が返る。発行元の課金設定を有効にする必要がある。

export ART_API_URL='https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent'
export ART_API_HEADER='x-goog-api-key: {key}'
export ART_API_BODY='{"contents":[{"parts":[{"text":"{prompt}"}]}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"{ratio}"}}}'
export ART_API_PATH='candidates.0.content.parts.*.inlineData.data'
# parts には説明文が先に入ることがある。* は「画像が入っている最初の要素」を意味する。

# ══════════════════════════════════════════════
# 他社の形（参考。この環境からは届かないことを確認済み）
# ══════════════════════════════════════════════
#
# OpenAI
#   ART_API_URL='https://api.openai.com/v1/images/generations'
#   ART_API_HEADER='Authorization: Bearer {key}'
#   ART_API_BODY='{"model":"gpt-image-1","prompt":"{prompt}","size":"1024x1024"}'
#   ART_API_PATH='data.0.b64_json'
#
# Stability
#   ART_API_URL='https://api.stability.ai/v2beta/stable-image/generate/core'
#   ART_API_HEADER='Authorization: Bearer {key}'
#   ART_API_BODY='{"prompt":"{prompt}","aspect_ratio":"{ratio}","output_format":"png"}'
#   ART_API_PATH='image'
#
# {prompt} は指示文、{ratio} は 5:4（主図版）か 2:3（人物図版）に置き換わる。
