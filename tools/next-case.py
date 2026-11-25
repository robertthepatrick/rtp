#!/usr/bin/env python3
"""Write the "Next case study" module into every case study page.

The order, titles, activities and thumbnails come from case-studies/index.html,
so reordering or adding a card there and re-running this script updates every
page. The last case study loops back to the first. A case the page already
links to in its own copy is skipped, so the module never repeats a link.

    python3 tools/next-case.py

Each page gets:
  - a <style id="next-case-css"> block before </head>
  - a white section between <!-- next-case:start --> and <!-- next-case:end -->,
    replacing the old "More work" row (or added before </main> the first time)
  - a small thumbnail at case-studies/img/next/<slug>.webp (made once, 720x480)

Re-running is safe: existing blocks are replaced, not duplicated.
"""
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "case-studies", "index.html")
THUMBS = os.path.join(ROOT, "case-studies", "img", "next")
TW, TH = 720, 480

CSS = """<style id="next-case-css">
/* next case study: white sign-off row before the footer, built by tools/next-case.py */
.next-case{background:var(--brand-white,#fff);color:var(--brand-black,#000);border-top:1px solid rgba(0,0,0,.12);padding-block:clamp(48px,6vw,96px)}
.nc-card{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:clamp(20px,3vw,48px);align-items:center;color:inherit;text-decoration:none}
.nc-fig{display:block;overflow:hidden;aspect-ratio:3/2}
.nc-fig img{display:block;width:100%;height:100%;max-width:100%;object-fit:cover;transition:transform 600ms var(--ease-out,ease)}
.nc-text{display:grid;gap:10px;justify-items:start;min-width:0}
.nc-label{font:600 12px/1.3 var(--font-display);letter-spacing:.1em;text-transform:uppercase;color:var(--brand-green,#015432)}
.nc-title{font:700 clamp(26px,3vw,44px)/1.08 var(--font-display);letter-spacing:-.02em;text-wrap:balance;max-width:20em}
.nc-acts{font:400 15px/1.5 var(--font-text);color:#595959}
.nc-go{margin-top:6px;font:600 14px/1.3 var(--font-display);letter-spacing:.06em;text-transform:uppercase;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px}
.nc-go span{display:inline-block;transition:transform 300ms var(--ease-out,ease)}
@media (hover:hover){.nc-card:hover .nc-fig img{transform:scale(1.04)}.nc-card:hover .nc-go span{transform:translateX(6px)}}
.nc-card:focus-visible{outline:3px solid var(--brand-black,#000);outline-offset:6px}
.nc-all{margin:clamp(28px,3vw,40px) 0 0;font:600 13px/1.3 var(--font-display);letter-spacing:.08em;text-transform:uppercase}
.nc-all a{color:inherit;text-underline-offset:5px}
@media (max-width:600px){.nc-card{grid-template-columns:minmax(0,1fr)}}
</style>
"""


def strip_tags(s):
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", s)).split())


def read_order():
    s = open(INDEX, encoding="utf-8").read()
    cases = []
    for art in re.findall(r'<article class="card[^"]*">(.*?)</article>', s, re.S):
        href = re.search(r'href="(/[^"]+/)"', art).group(1)
        img = re.search(r'<img[^>]*src="([^"]+)"', art).group(1)
        title = strip_tags(re.search(r'<h2 class="title"><a[^>]*>(.*?)</a>', art, re.S).group(1))
        acts = [strip_tags(a) for a in re.findall(r"<li>(.*?)</li>", art, re.S)][:3]
        cases.append({"href": href, "slug": href.strip("/"), "img": img, "title": title, "acts": acts})
    return cases


def make_thumb(case):
    from PIL import Image
    os.makedirs(THUMBS, exist_ok=True)
    out = os.path.join(THUMBS, case["slug"] + ".webp")
    if os.path.exists(out):
        return
    im = Image.open(os.path.join(ROOT, "case-studies", case["img"])).convert("RGB")
    r = TW / TH
    w, h = im.size
    if w / h > r:
        nw = round(h * r)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = round(w / r)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.resize((TW, TH), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)


def block(nxt):
    e = html.escape
    return (
        '<!-- next-case:start -->\n'
        '  <section class="next-case" aria-labelledby="next-case-h">\n'
        '    <div class="wrap">\n'
        f'      <a class="nc-card" href="{nxt["href"]}">\n'
        f'        <span class="nc-fig"><img src="/case-studies/img/next/{nxt["slug"]}.webp" width="{TW}" height="{TH}" alt="" loading="lazy" decoding="async"></span>\n'
        '        <span class="nc-text">\n'
        '          <span class="nc-label" id="next-case-h">Next case study</span>\n'
        f'          <span class="nc-title">{e(nxt["title"])}</span>\n'
        f'          <span class="nc-acts">{" · ".join(e(a) for a in nxt["acts"])}</span>\n'
        '          <span class="nc-go">Read the case study <span aria-hidden="true">→</span></span>\n'
        '        </span>\n'
        '      </a>\n'
        '      <p class="nc-all"><a href="/case-studies/">All the work</a></p>\n'
        '    </div>\n'
        '  </section>\n'
        '  <!-- next-case:end -->'
    )


def write_page(case, nxt):
    path = os.path.join(ROOT, case["slug"], "index.html")
    s = open(path, encoding="utf-8").read()
    b = block(nxt)
    if "<!-- next-case:start -->" in s:
        s = re.sub(r"<!-- next-case:start -->.*?<!-- next-case:end -->", lambda m: b, s, flags=re.S)
    else:
        more = re.search(r'  <section class="sec" aria-label="More work">.*?</section>', s, re.S)
        if more:
            s = s[:more.start()] + "  " + b + s[more.end():]
        else:
            s = s.replace("</main>", "  " + b + "\n\n</main>", 1)
    if '<style id="next-case-css">' in s:
        s = re.sub(r'<style id="next-case-css">.*?</style>\n', lambda m: CSS, s, flags=re.S)
    else:
        s = s.replace("</head>", CSS + "</head>", 1)
    open(path, "w", encoding="utf-8").write(s)


def pick_next(cases, i):
    """The next case in order, skipping any the page already links to in its own copy
    (e.g. AGO links to GoUnicode, so AGO's next is the one after GoUnicode)."""
    page = open(os.path.join(ROOT, cases[i]["slug"], "index.html"), encoding="utf-8").read()
    page = re.sub(r"<!-- next-case:start -->.*?<!-- next-case:end -->", "", page, flags=re.S)
    for k in range(1, len(cases)):
        cand = cases[(i + k) % len(cases)]
        if f'href="{cand["href"]}"' not in page and f'href="..{cand["href"]}"' not in page:
            return cand
    return cases[(i + 1) % len(cases)]


def main():
    cases = read_order()
    if not cases:
        sys.exit("No case study cards found in case-studies/index.html")
    for c in cases:
        make_thumb(c)
    for i, c in enumerate(cases):
        nxt = pick_next(cases, i)
        write_page(c, nxt)
        print(f'{c["slug"]:22} -> {nxt["slug"]}')


if __name__ == "__main__":
    main()
