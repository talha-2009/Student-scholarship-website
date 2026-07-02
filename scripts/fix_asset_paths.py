#!/usr/bin/env python3
import os
from pathlib import Path

ROOT = Path('/workspaces/Student-scholarship-website')
replacements = [
    ('/styles.css', 'styles.css'),
    ('/script.js', 'script.js'),
    ('/nav.js', 'nav.js'),
    ('/logo.svg', 'logo.svg'),
    ('/favicon.svg', 'favicon.svg'),
    ('/favicon.ico', 'favicon.ico'),
    ('/apple-touch-icon.png', 'apple-touch-icon.png'),
    ('/favicon-32x32.png', 'favicon-32x32.png'),
    ('/favicon-16x16.png', 'favicon-16x16.png')
]
extra_js = ['/utils.js','/category.js','/contact.js','/opportunity-detail.js','/internship-detail.js']

html_files = list(ROOT.rglob('*.html'))
changes = []
for f in html_files:
    rel = f.relative_to(ROOT)
    depth = len(rel.parts) - 1  # number of directories between file and root
    prefix = '../' * depth
    text = f.read_text(encoding='utf-8')
    new = text

    for old, name in replacements:
        # replace occurrences of old when they appear as quoted paths
        # compute replacement with proper prefix
        if depth == 0:
            rep = f'"{name}"'
            new = new.replace(f'"{old}"', rep)
            new = new.replace(f"'{old}'", f"'{name}'")
        else:
            rep = f'"{prefix}{name}"'
            new = new.replace(f'"{old}"', rep)
            new = new.replace(f"'{old}'", f"'{prefix}{name}'")

    # Replace some common JS includes
    for js in extra_js:
        key = f'"{js}"'
        key2 = f"'{js}'"
        tgt = js.lstrip('/')
        if depth == 0:
            new = new.replace(key, f'"{tgt}"')
            new = new.replace(key2, f"'{tgt}'")
        else:
            new = new.replace(key, f'"{prefix}{tgt}"')
            new = new.replace(key2, f"'{prefix}{tgt}'")

    # Replace internal absolute anchor hrefs (href="/path") -> relative paths
    # Avoid changing external links (starting with http)
    import re
    def replace_anchor(match):
        quote = match.group(1)
        path = match.group(2)
        if path.startswith('http'):
            return match.group(0)
        newpath = prefix + path.lstrip('/')
        return f'href={quote}{newpath}{quote}'

    new = re.sub(r'href=("|\')(\/[^\"\']+)("|\')', replace_anchor, new)

    if new != text:
        f.write_text(new, encoding='utf-8')
        changes.append(str(rel))

print('Updated files:', len(changes))
for c in changes:
    print(c)
