#!/usr/bin/env python3
import os, re, json
from html import unescape

ROOT = 'opportunity'

files = []
for dirpath, dirs, filenames in os.walk(ROOT):
    for f in filenames:
        if f == 'index.html':
            files.append(os.path.join(dirpath, f))
files.sort()

issues = {}

for path in files:
    with open(path, 'r', encoding='utf-8') as fh:
        txt = fh.read()
    # find canonical
    can = None
    m = re.search(r'<link rel="canonical" href="([^"]+)"', txt)
    if m:
        can = m.group(1)
    # find visible breadcrumbs
    nav = re.search(r'<nav class="breadcrumbs"[^>]*>(.*?)</nav>', txt, re.S)
    visible = []
    if nav:
        inner = nav.group(1)
        # find <a> texts and final <span aria-current> text
        as_ = re.findall(r'<a[^>]*>(.*?)</a>', inner, re.S)
        # strip tags
        def strip_tags(s):
            return unescape(re.sub(r'<[^>]+>', '', s)).strip()
        for a in as_:
            visible.append(strip_tags(a))
        last = re.search(r'<span[^>]*aria-current="page"[^>]*>(.*?)</span>', inner, re.S)
        if last:
            visible.append(strip_tags(last.group(1)))
    # find json-ld breadcrumbs
    jlds = re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', txt, re.S)
    bl = None
    for jd in jlds:
        try:
            data = json.loads(jd)
        except Exception:
            try:
                data = json.loads(unescape(jd))
            except Exception:
                continue
        if isinstance(data, dict) and data.get('@type') == 'BreadcrumbList':
            bl = data
            break
    file_issues = []
    if not bl:
        file_issues.append('Missing BreadcrumbList JSON-LD')
    else:
        elems = bl.get('itemListElement')
        if not isinstance(elems, list):
            file_issues.append('itemListElement missing or not a list')
        else:
            positions = [e.get('position') for e in elems]
            if len(set(positions)) != len(positions):
                file_issues.append('Duplicate positions in JSON-LD')
            if positions != list(range(1, len(positions)+1)):
                file_issues.append(f'Positions not sequential starting at 1: {positions}')
            # last item check
            last_item = elems[-1] if elems else None
            if last_item:
                item_url = last_item.get('item')
                if can and item_url and can.rstrip('/') != item_url.rstrip('/'):
                    file_issues.append(f'Last breadcrumb item URL does not match canonical ({item_url} != {can})')
            # name vs visible
            names = [e.get('name') for e in elems]
            if visible and names and len(visible) == len(names):
                for i,(v,n) in enumerate(zip(visible,names), start=1):
                    if v != n:
                        file_issues.append(f'Visible breadcrumb "{v}" != JSON-LD name "{n}" at position {i}')
            # check URLs absolute
            for e in elems:
                u = e.get('item')
                if u and not u.startswith('http'):
                    file_issues.append(f'Breadcrumb URL not absolute: {u}')
    if file_issues:
        issues[path] = file_issues

# output report
print('Total opportunity pages:', len(files))
print('Pages with issues:', len(issues))
for p,its in issues.items():
    print('\n'+p)
    for it in its:
        print(' -', it)

# exit code
if issues:
    exit(2)
else:
    print('All breadcrumb JSON-LD validated. No issues found.')
    exit(0)
