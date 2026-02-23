from PIL import Image, ImageDraw, ImageFont
import os

# Configuration
WIDTH = 1200
HEIGHT = 810
BG_IMAGE_PATH = "public/rich_menu_bg_atelier_v2.png"
OUTPUT_PATH = "public/rich-menu-final-mincho.png"

# Colors
TEXT_COLOR = (255, 255, 255, 255)
SHADOW_COLOR = (0, 0, 0, 150)
OVERLAY_COLOR = (0, 0, 0, 40) 

# Layout (3 columns x 2 rows)
COLS = 3
ROWS = 2
CELL_W = WIDTH // COLS
CELL_H = HEIGHT // ROWS

# Content
MENU_ITEMS = [
    # Row 1
    {"text": "ご注文・予約", "sub": "Order / Reserve"},
    {"text": "Instagram", "sub": "作例・カタログ"},
    {"text": "24h無人店舗", "sub": "利用ガイド"},
    # Row 2
    {"text": "よくある質問", "sub": "FAQ"},
    {"text": "店舗情報", "sub": "Access & Map"},
    {"text": "個別相談", "sub": "Chat Support"}
]

def create_rich_menu():
    # 1. Load Background
    if os.path.exists(BG_IMAGE_PATH):
        bg = Image.open(BG_IMAGE_PATH).convert("RGBA")
        bg = bg.resize((WIDTH, HEIGHT), Image.LANCZOS)
    else:
        print("Background image not found.")
        bg = Image.new("RGBA", (WIDTH, HEIGHT), (50, 50, 50, 255))

    # 2. Draw Overlay
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0,0,0,0))
    d = ImageDraw.Draw(overlay)

    # Fonts
    # Using Hiragino Mincho ProN (Serif/Elegant)
    font_jp_path = "/System/Library/Fonts/ヒラギノ明朝 ProN.ttc"
    
    try:
        # Increase font size slightly since there are no icons
        font_main = ImageFont.truetype(font_jp_path, 50, index=0)
        font_sub = ImageFont.truetype(font_jp_path, 24, index=0)
        print("Loaded Hiragino Mincho ProN successfully.")
    except Exception as e:
        print(f"Font loading failed: {e}")
        # Fallback to SourceHanCodeJP if Mincho fails usage
        try:
             font_jp_path = "/Library/Fonts/SourceHanCodeJP.ttc"
             font_main = ImageFont.truetype(font_jp_path, 50, index=0)
             font_sub = ImageFont.truetype(font_jp_path, 24, index=0)
        except:
             font_main = ImageFont.load_default()
             font_sub = ImageFont.load_default()

    # Draw Grid and Text
    for i, item in enumerate(MENU_ITEMS):
        row = i // COLS
        col = i % COLS
        
        x = col * CELL_W
        y = row * CELL_H
        
        # Center of cell
        cx = x + CELL_W // 2
        cy = y + CELL_H // 2
        
        # Draw background tint for cell
        d.rectangle([x + 10, y + 10, x + CELL_W - 10, y + CELL_H - 10], fill=OVERLAY_COLOR)
        
        # Draw Text
        # Center vertically now (Main text at center-ish, Sub below)
        
        # Main Label (Using anchor 'mm' for middle-middle alignment)
        d.text((cx, cy - 15), item["text"], font=font_main, fill=TEXT_COLOR, anchor="mm", stroke_width=2, stroke_fill=SHADOW_COLOR)
        
        # Sub Label
        d.text((cx, cy + 30), item["sub"], font=font_sub, fill=TEXT_COLOR, anchor="mm", stroke_width=1, stroke_fill=SHADOW_COLOR)

    # Composite
    out = Image.alpha_composite(bg, overlay)
    out.save(OUTPUT_PATH)
    print(f"Saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    create_rich_menu()
