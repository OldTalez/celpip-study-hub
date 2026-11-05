"""LEARNING NOTE (for beginners): draws the app's icons (a white speech bubble holding a letter C on Lakeline teal) with the
Pillow picture library, so the PNG files can be rebuilt at any time:  python tools/make-icons.py   (run from the app folder).
The shapes are written in a 100 x 100 grid and scaled up, the same numbers as favicon.svg, so the two stay identical.
Pictures are drawn 8 times bigger and shrunk at the end: that smooths the edges ("supersampling").
"Maskable" icons are cut to a circle or rounded shape by the phone, so their picture must sit inside the middle 80%
(the "safe zone") and the teal must reach every edge. Plain "any" icons keep their own rounded corners."""
from PIL import Image, ImageDraw
import math, os
TEAL = (11, 100, 119)       # #0b6477 = --accent-fill in css/style.css (light theme)
WHITE = (255, 255, 255)
SS = 8                      # supersampling factor
here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

def mark(d, k, ox, oy, zoom):
    """Draw bubble + C. k = pixels per grid unit; (ox, oy) = where grid point (50,50) lands; zoom scales the mark."""
    def P(x, y): return (ox + (x - 50) * k * zoom, oy + (y - 50) * k * zoom)
    x0, y0 = P(18, 22); x1, y1 = P(82, 68)
    d.rounded_rectangle([x0, y0, x1, y1], radius=14 * k * zoom, fill=WHITE)
    d.polygon([P(30, 64), P(30, 82), P(48, 64)], fill=WHITE)             # the bubble's tail
    cx, cy = P(50, 45); r = 14 * k * zoom; w = 7 * k * zoom
    R = r + w / 2                                                         # PIL draws a wide arc inward from its box, so grow the box by half the stroke
    d.arc([cx - R, cy - R, cx + R, cy + R], 40, 320, fill=TEAL, width=int(w))   # the letter C (opening on the right)
    for a in (40, 320):                                                   # round ends on the C
        ex, ey = cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))
        d.ellipse([ex - w / 2, ey - w / 2, ex + w / 2, ey + w / 2], fill=TEAL)

def icon(size, maskable, zoom=1.0):
    big = size * SS; k = big / 100
    im = Image.new("RGBA", (big, big), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if maskable: d.rectangle([0, 0, big, big], fill=TEAL)                 # full-bleed teal
    else: d.rounded_rectangle([0, 0, big - 1, big - 1], radius=22 * k, fill=TEAL)
    # The mark spans grid x 18..82 (64 units) and y 22..82. For maskable, 0.8 safe zone = circle of radius 40 around the centre;
    # the mark's farthest corner is about 38 units from (50,52), so zoom 0.95 keeps it inside the circle.
    mark(d, k, big / 2, big * 0.5 - 2 * k * zoom, zoom)
    return im.resize((size, size), Image.LANCZOS)

def glyph_icon(size, kind):
    """Shortcut icons: teal square with one white line drawing (calendar, pencil, clock)."""
    big = size * SS; k = big / 100
    im = Image.new("RGBA", (big, big), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, big - 1, big - 1], radius=22 * k, fill=TEAL)
    w = int(7 * k)
    def L(pts): d.line([(x * k, y * k) for x, y in pts], fill=WHITE, width=w, joint="curve")
    if kind == "plan":
        d.rounded_rectangle([24 * k, 28 * k, 76 * k, 76 * k], radius=6 * k, outline=WHITE, width=w)
        L([(24, 46), (76, 46)]); L([(36, 20), (36, 34)]); L([(64, 20), (64, 34)])
    elif kind == "practice":
        L([(30, 72), (34, 60), (66, 28), (72, 34), (40, 66), (30, 72)]); L([(58, 36), (64, 42)])
    else:
        d.ellipse([24 * k, 28 * k, 76 * k, 80 * k], outline=WHITE, width=w)
        L([(50, 42), (50, 54), (59, 60)]); L([(42, 20), (58, 20)])
    return im.resize((size, size), Image.LANCZOS)

icon(512, False).save(os.path.join(here, "icon-512.png"))
icon(192, False).save(os.path.join(here, "icon-192.png"))
icon(512, True, 0.95).save(os.path.join(here, "icon-maskable-512.png"))
# Apple draws its own rounded corners and dislikes transparency, so this one is full-bleed teal.
icon(180, True, 1.1).save(os.path.join(here, "apple-touch-icon-180.png"))
for kind in ("plan", "practice", "exam"):
    glyph_icon(96, kind).save(os.path.join(here, "shortcut-%s-96.png" % kind))
print("icons written")
