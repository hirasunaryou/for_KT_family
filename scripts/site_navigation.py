"""Shared static navigation for hosted pages; no JavaScript dependency."""
from pathlib import Path, PurePosixPath
import posixpath
import re

ROOT = Path(__file__).resolve().parents[1]


def add_site_navigation(html, page_path):
    page = PurePosixPath(page_path)
    if str(page) == 'index.html':
        return html
    if 'class="site-return-nav"' in html:
        return html
    relative = lambda target: posixpath.relpath(target, str(page.parent))
    links = f'<a class="site-home-link" href="{relative("index.html")}">サイトのトップ</a>'
    for section, label in [('math', '数学の教材一覧'), ('programming', 'プログラミングの教材一覧')]:
        if str(page).startswith(f'study/{section}/') and len(page.parts) > 3:
            links += f'<a href="{relative(f"study/{section}/index.html")}">{label}</a>'
    nav = f'<nav class="site-return-nav" aria-label="サイト内の移動">{links}</nav>'
    html = html.replace('</head>', f'<link rel="stylesheet" href="{relative("assets/family/navigation.css")}"></head>', 1)
    # Place before application roots so chapter changes never replace the navigation.
    def body(match):
        tag = match[0]
        if 'class="' in tag:
            tag = tag.replace('class="', 'class="has-site-navigation ', 1)
        else:
            tag = tag.replace('<body', '<body class="has-site-navigation"', 1)
        return tag + nav
    html = re.sub(r'<body\b[^>]*>', body, html, count=1)
    html = re.sub(r'(<nav class="site-return-nav".*?</nav>)(\s*<a class="skip"[^>]*>.*?</a>)', r'\2\1', html, count=1)
    return html


if __name__ == '__main__':
    for directory in ['study', 'questions']:
        for page in (ROOT / directory).rglob('index.html'):
            source = page.read_text()
            result = add_site_navigation(source, page.relative_to(ROOT).as_posix())
            if result != source:
                page.write_text(result)
                print(page.relative_to(ROOT))
