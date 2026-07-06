#!/usr/bin/env python3
"""
merge_product_images.py

Reads import/htclazer-urun-gorselleri.csv (columns: product_id,link), downloads
each gallery image, and attaches a `galleryImages` field to the matching product
in content/products/products.json (match key: product_id == sourceProductId).

Deduplication ("fotograflar duplike olmasin") is PERCEPTUAL, not byte-based:
each image gets a dHash (difference hash); an image is dropped if it is visually
the same as the product's existing MAIN image or an already-kept gallery image —
even when it is a different resolution / re-compression (which is exactly how the
main image and its gallery twin differ between the old and new sites).

Self-hosts kept images under frontend/public/media/products/<product_id>/<md5>.<ext>
and prunes orphaned files — but NEVER prunes a product whose downloads failed,
so a transient network error can't wipe existing images.

Downloads use `curl` (reliable system SSL) rather than urllib.

Usage:  python3 scripts/merge_product_images.py   (or: npm run products:images)

NOTE: products.json is the source of truth the frontend reads. If you regenerate
it via `npm run products:transform:htc`, re-run this script afterwards.
"""

import csv
import hashlib
import io
import json
import os
import subprocess
from collections import OrderedDict

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(ROOT, "import", "htclazer-urun-gorselleri.csv")
PRODUCT_JSON = os.path.join(ROOT, "content", "products", "products.json")
MEDIA_DIR = os.path.join(ROOT, "frontend", "public", "media", "products")
PUBLIC_BASE = "/media/products"

# dHash Hamming-distance threshold below which two images are "the same photo".
# Same photo at different resolution/compression -> ~0-6; distinct photos -> >15.
DUPLICATE_THRESHOLD = 8

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124 Safari/537.36")

FORMAT_EXT = {"jpeg": "jpg", "jpg": "jpg", "png": "png", "webp": "webp", "gif": "gif", "mpo": "jpg"}


def fetch(url):
    """Return (bytes, None) on success or (None, reason) on failure."""
    try:
        r = subprocess.run(
            ["curl", "-sSL", "--max-time", "30", "-A", UA, url],
            capture_output=True,
        )
    except Exception as e:
        return None, f"{type(e).__name__}: {e}"
    if r.returncode != 0 or not r.stdout:
        reason = (r.stderr.decode("utf-8", "ignore").strip() or f"curl rc={r.returncode}")
        return None, reason[:140]
    return r.stdout, None


def decode(data):
    """Return (dhash_int, ext) or (None, None) if it isn't a decodable image."""
    try:
        img = Image.open(io.BytesIO(data))
        ext = FORMAT_EXT.get((img.format or "").lower(), "jpg")
        gray = img.convert("L").resize((9, 8), Image.LANCZOS)
        px = list(gray.getdata())
        bits = 0
        for row in range(8):
            base = row * 9
            for col in range(8):
                bits = (bits << 1) | (1 if px[base + col] > px[base + col + 1] else 0)
        return bits, ext
    except Exception:
        return None, None


def hamming(a, b):
    return bin(a ^ b).count("1")


def read_csv_grouped():
    grouped = OrderedDict()
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for i, row in enumerate(csv.reader(f)):
            if i == 0 and row and row[0].strip().lower() == "product_id":
                continue
            if len(row) < 2:
                continue
            pid = row[0].strip()
            link = ",".join(row[1:]).strip()  # tolerate commas inside URLs
            if not pid or not link:
                continue
            grouped.setdefault(pid, [])
            if link not in grouped[pid]:
                grouped[pid].append(link)
    return grouped


def main():
    grouped = read_csv_grouped()
    with open(PRODUCT_JSON, encoding="utf-8") as f:
        data = json.load(f)
    products = data.get("products", [])
    by_source = {str(p["sourceProductId"]): p for p in products if p.get("sourceProductId")}

    url_cache = {}  # url -> (bytes, dhash, ext) or None
    downloaded = perceptual_dups = failed = pruned = 0
    failures = []
    dup_examples = []

    for pid, links in grouped.items():
        product = by_source.get(pid)
        if not product:
            continue

        had_failure = False
        kept_hashes = []  # (tag, dhash)

        # seed with the existing MAIN image so the gallery never repeats it
        main_url = (product.get("image") or {}).get("sourceUrl")
        if main_url:
            mdata, _ = fetch(main_url)
            if mdata:
                mh, _ = decode(mdata)
                if mh is not None:
                    kept_hashes.append(("__main__", mh))

        nodes = []
        kept_files = set()
        for url in links:
            if url not in url_cache:
                raw, reason = fetch(url)
                if raw is None:
                    url_cache[url] = None
                    failures.append(f"{pid}  {url}  -> {reason}")
                else:
                    h, ext = decode(raw)
                    url_cache[url] = (raw, h, ext) if h is not None else None
                    if h is None:
                        failures.append(f"{pid}  {url}  -> not a decodable image")
            entry = url_cache[url]
            if entry is None:
                failed += 1
                had_failure = True
                continue

            raw, h, ext = entry
            dup_of = next((tag for tag, kh in kept_hashes if hamming(h, kh) <= DUPLICATE_THRESHOLD), None)
            if dup_of is not None:
                perceptual_dups += 1
                if len(dup_examples) < 15:
                    dup_examples.append(f"{pid}: dropped {url.rsplit('/', 1)[-1]} (≈ {dup_of})")
                continue

            kept_hashes.append((url.rsplit("/", 1)[-1], h))
            md5 = hashlib.md5(raw).hexdigest()
            fname = f"{md5}.{ext}"
            kept_files.add(fname)
            abs_path = os.path.join(MEDIA_DIR, pid, fname)
            if not os.path.exists(abs_path):
                os.makedirs(os.path.dirname(abs_path), exist_ok=True)
                with open(abs_path, "wb") as out:
                    out.write(raw)
                downloaded += 1
            nodes.append({"sourceUrl": f"{PUBLIC_BASE}/{pid}/{fname}", "altText": product.get("name", "")})

        # SAFETY: never prune/strip a product whose downloads failed -> protects
        # existing images from being wiped on a transient network error.
        pdir = os.path.join(MEDIA_DIR, pid)
        if nodes:
            product["galleryImages"] = {"nodes": nodes}
            if os.path.isdir(pdir):
                for existing in os.listdir(pdir):
                    if existing not in kept_files:
                        os.remove(os.path.join(pdir, existing))
                        pruned += 1
        elif not had_failure and "galleryImages" in product:
            del product["galleryImages"]

    with open(PRODUCT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    with_gallery = sum(1 for p in products if p.get("galleryImages", {}).get("nodes"))
    total_imgs = sum(len(p.get("galleryImages", {}).get("nodes", [])) for p in products)
    print("--- merge_product_images summary ---")
    print(f"products with a gallery: {with_gallery}/{len(products)}")
    print(f"gallery images kept (total): {total_imgs}")
    print(f"images downloaded this run: {downloaded}")
    print(f"perceptual duplicates dropped: {perceptual_dups}")
    print(f"orphan files pruned: {pruned}")
    print(f"failed downloads: {failed}")
    if dup_examples:
        print("--- sample perceptual drops ---")
        for d in dup_examples:
            print("  " + d)
    if failures:
        print(f"--- failures ({len(failures)}) ---")
        for fl in failures[:20]:
            print("  " + fl)


if __name__ == "__main__":
    main()
