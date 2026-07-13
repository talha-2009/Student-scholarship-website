#!/usr/bin/env python3
import importlib.util
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATOR_PATH = ROOT / "scripts" / "generate-seo-pages.py"

spec = importlib.util.spec_from_file_location("seo_generator", GENERATOR_PATH)
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class LandingParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.h1 = ""
        self.canonical = []
        self.schemas = []
        self._in_title = False
        self._in_h1 = False
        self._in_schema = False
        self._schema_buffer = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "h1":
            self._in_h1 = True
        elif tag == "link" and attributes.get("rel") == "canonical":
            self.canonical.append(attributes.get("href"))
        elif tag == "script" and attributes.get("type") == "application/ld+json":
            self._in_schema = True
            self._schema_buffer = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
        elif tag == "script" and self._in_schema:
            self.schemas.append(json.loads("".join(self._schema_buffer)))
            self._in_schema = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_h1:
            self.h1 += data
        if self._in_schema:
            self._schema_buffer.append(data)


def schema_types(schemas):
    types = []
    for schema in schemas:
        if "@graph" in schema:
            types.extend(node.get("@type") for node in schema["@graph"])
        else:
            types.append(schema.get("@type"))
    return set(types)


def main():
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    sitemap_urls = re.findall(r"<loc>(.*?)</loc>", sitemap)
    failures = []
    rows = []

    for definition in generator.LANDING_PAGE_DEFINITIONS:
        relative_path = Path(definition["path"]) / "index.html"
        page_path = ROOT / relative_path
        html = page_path.read_text(encoding="utf-8")
        parser = LandingParser()
        parser.feed(html)
        canonical = f"{generator.SITE_URL}/{definition['path']}/"
        cards = html.count('class="live-opportunity-card')
        copy_sections = generator.build_landing_copy(definition, cards)
        copy_words = sum(
            len(re.findall(r"\b[\w'-]+\b", text))
            for _, text in copy_sections
        )
        required_schemas = {
            "BreadcrumbList",
            "CollectionPage",
            "ItemList",
            "FAQPage",
            "Organization",
            "WebSite"
        }
        found_schemas = schema_types(parser.schemas)

        checks = {
            "one_title": bool(parser.title.strip()),
            "one_h1": bool(parser.h1.strip()) and html.count("<h1") == 1,
            "canonical": parser.canonical == [canonical],
            "copy_length": 300 <= copy_words <= 600,
            "visible_faq": "Frequently asked questions" in html,
            "schemas": required_schemas.issubset(found_schemas),
            "sitemap": canonical in sitemap_urls
        }

        for check, passed in checks.items():
            if not passed:
                failures.append(f"/{definition['path']}/ failed {check}")

        rows.append({
            "route": f"/{definition['path']}/",
            "cards": cards,
            "copy_words": copy_words,
            "title": parser.title.strip(),
            "checks": checks
        })

    duplicate_titles = {
        title: count
        for title, count in Counter(row["title"] for row in rows).items()
        if count > 1
    }
    if duplicate_titles:
        failures.append(f"Duplicate landing titles: {duplicate_titles}")

    duplicate_sitemap_urls = len(sitemap_urls) - len(set(sitemap_urls))
    if duplicate_sitemap_urls:
        failures.append(f"Duplicate sitemap URLs: {duplicate_sitemap_urls}")

    print(json.dumps(rows, indent=2))
    print(f"Landing pages checked: {len(rows)}")
    print(f"Failures: {len(failures)}")
    for failure in failures:
        print(f"- {failure}")

    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
