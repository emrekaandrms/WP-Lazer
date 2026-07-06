#!/usr/bin/env python3
"""
enrich_product_content.py

Generates a clean, keyword-rich `shortDescription` for every product in
content/products/products.json from existing structured data (name + compatible
brand + category + top technical attributes). Replaces the current placeholder
shortDescriptions (which just repeat the product name) so that product previews
AND the Google Merchant feed (which uses shortDescription) carry real content.

Idempotent / re-runnable: it derives everything from the product data, so it is
safe to run again — including after `npm run products:transform:htc`.

Usage:  python3 scripts/enrich_product_content.py   (or: npm run products:content)
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUCT_JSON = os.path.join(ROOT, "content", "products", "products.json")

BRAND = {
    "PRECITEC": "Precitec", "RAYTOOLS": "Raytools", "BYSTRONIC": "Bystronic",
    "NUKON": "Nukon", "HIGHYAG": "HighYag", "NUKON/HIGHYAG": "Nukon/HighYag",
    "WSX": "WSX", "BOCI": "Boci", "OSPRI": "Ospri",
}

# Category slug -> natural noun phrase used in the description.
PHRASE = {
    "seramikler": "fiber lazer kesim kafası seramik tutucu",
    "koruma-camlari": "fiber lazer lens koruma camı",
    "nozullar": "fiber lazer kesim nozulu",
    "lensler": "fiber lazer odak/kolimatör lensi",
    "lazer-kaynak": "lazer kaynak sarf malzemesi",
}

# Attributes that are noise in a technical-spec context.
NOISE_ATTRS = {"marka", "model", "para birimi"}

# Machine brands that may appear in imported old-site descriptions. Preserved
# because /marka/<machine> landing pages match on description text.
MACHINE_BRANDS = ["Durma", "Durmazlar", "Ermaksan", "Dener", "MVD", "Mvd", "Accurl", "Bodor", "Nukon", "HSG", "Baykal"]

# noun + correct Turkish copula suffix ("...dur/dır/tir")
CAT_NOUN = {
    "seramikler": ("seramik tutucu", "dur"),
    "koruma-camlari": ("lens koruma camı", "dır"),
    "nozullar": ("kesim nozulu", "dur"),
    "lensler": ("optik lens", "tir"),
    "lazer-kaynak": ("lazer kaynak sarf parçası", "dır"),
}


def tr_label_lower(s):
    return s.replace("İ", "i").replace("I", "ı").lower()


def brand_label(manufacturer):
    if not manufacturer:
        return ""
    key = manufacturer.strip().upper()
    if key == "LAZER KAYNAK":
        return ""
    return BRAND.get(key, manufacturer.strip().title())


# Turkish-correct lowercase (I -> ı, İ -> i), then standard lower for the rest.
def tr_lower(s):
    return s.replace("I", "ı").replace("İ", "i").lower()


# Lower-cased connector words.
CONNECTORS = {"VE": "ve", "İLE": "ile", "VEYA": "veya"}


def clean_name(name):
    """Make a raw/ALL-CAPS display name readable WITHOUT touching slugs/URLs.

    Safe & idempotent: brand tokens use the correct casing map; codes, part
    numbers, dimensions and short acronyms (<=3 letters) are left untouched;
    long ALL-CAPS pure-letter words get Turkish-correct title casing; already
    mixed-case tokens are left as-is. Re-running yields the same result.
    """
    name = re.sub(r"\s+", " ", name).strip()
    out = []
    for tok in name.split(" "):
        key = tok.upper()
        if key in BRAND:                       # PRECITEC -> Precitec
            out.append(BRAND[key])
        elif key in CONNECTORS:                # VE -> ve
            out.append(CONNECTORS[key])
        elif not tok.isalpha():                # codes, part-no, 5", D28, M11...
            out.append(tok)
        elif tok == tok.upper() and len(tok) >= 4:   # LENS -> Lens, TUTUCU -> Tutucu
            out.append(tok[0] + tr_lower(tok[1:]))
        else:                                  # short acronyms / already mixed-case
            out.append(tok)
    return " ".join(out)


def build_short(product):
    name = (product.get("name") or "").strip()
    cat = (product.get("categories", {}).get("nodes") or [{}])[0]
    phrase = PHRASE.get(cat.get("slug"), "fiber lazer sarf malzemesi")
    brand = brand_label(product.get("manufacturer"))
    lead = f"{brand} uyumlu " if (brand and brand.lower() not in name.lower()) else ""

    specs = [
        (a.get("label"), a.get("value"))
        for a in product.get("attributes", {}).get("nodes", [])
        if (a.get("label", "").strip().lower() not in NOISE_ATTRS) and a.get("value")
    ]
    spec_str = " · ".join(f"{label}: {value}" for label, value in specs[:4])

    text = f"{lead}{name} — {phrase}."
    if spec_str:
        text += f" {spec_str}."
    text += " Stokta, hızlı kargo ve teknik destek — Lazer Online."
    return text


def extract_machines(text):
    """Machine brand names mentioned in text, normalized, order-preserving."""
    found = []
    low = text.lower()
    for m in MACHINE_BRANDS:
        if m.lower() in low:
            norm = "MVD" if m.lower() == "mvd" else m
            if norm not in found:
                found.append(norm)
    return found


def extract_notes(text):
    """Carry over business-critical sentences (e.g. 'eski kovan iade') from the imported description."""
    import re as _re
    notes = []
    for sentence in _re.split(r"(?<=[.!])\s+", text or ""):
        if _re.search(r"(?i)kovan|iade edilmesi|dahil fiyat", sentence) and len(sentence) < 160:
            notes.append(sentence.strip())
    return notes


def build_description(product):
    """Unique-to-this-site product description built from structured facts.

    The imported descriptions are verbatim copies of the old store (duplicate
    content, which suppresses this site in Google). Same facts, our own wording.
    Template variants keyed off the SKU hash so pages don't all share one skeleton.
    """
    name = (product.get("name") or "").strip()
    sku = product.get("sku") or name
    cat = (product.get("categories", {}).get("nodes") or [{}])[0]
    noun, suffix = CAT_NOUN.get(cat.get("slug"), ("fiber lazer sarf parçası", "dır"))
    brand = brand_label(product.get("manufacturer"))
    machines = product.get("machines") or []
    notes = product.get("descriptionNotes") or []

    specs = [
        (a.get("label"), a.get("value"))
        for a in product.get("attributes", {}).get("nodes", [])
        if (a.get("label", "").strip().lower() not in NOISE_ATTRS) and a.get("value")
    ]

    v = sum(ord(c) for c in sku) % 3

    brandtxt = f"{brand} ve eşdeğeri" if brand else "yaygın fiber lazer"
    openers = [
        f"{name}, {brandtxt} kesim kafalarıyla uyumlu olarak üretilen bir {noun}{suffix}.",
        f"Üretiminizi durdurmadan yenileyebileceğiniz {name}, {brandtxt} kafalar için doğru ölçü ve işçilikle hazırlanan bir {noun}{suffix}.",
        f"{brandtxt.capitalize()} kafa kullanan makineler için geliştirilen {name}, yüksek güç altında kararlı performans sunan bir {noun}{suffix}.",
    ]
    parts = [openers[v]]

    if specs:
        spec_str = ", ".join(f"{tr_label_lower(label)} {value}" for label, value in specs[:5])
        spec_sentences = [
            f"Teknik değerler: {spec_str}.",
            f"Öne çıkan teknik özellikleri {spec_str} olarak özetlenebilir.",
            f"Ürünün teknik karşılığı: {spec_str}.",
        ]
        parts.append(spec_sentences[v])

    if machines:
        mtxt = ", ".join(machines[:-1]) + f" ve {machines[-1]}" if len(machines) > 1 else machines[0]
        machine_sentences = [
            f"Sahada en çok {mtxt} lazer kesim makinelerinde tercih edilir.",
            f"{mtxt} gibi makinelerle birlikte yaygın olarak kullanılır.",
            f"{mtxt} makinelerinde çalışan operatörlerin düzenli yenilediği sarflar arasındadır.",
        ]
        parts.append(machine_sentences[v])

    parts.extend(notes)

    closers = [
        "Stoktan hızlı kargolanır; ücretsiz kargo ve teknik destek Lazer Online güvencesiyle sunulur.",
        "Ücretsiz kargo ile stoktan hızlı teslim edilir; ölçü uyumundan emin değilseniz kafa modelinizi paylaşmanız yeterlidir.",
        "Doğru seçim için ürün kodunu veya kafa modelinizi iletebilirsiniz; ücretsiz kargo ile stoktan gönderilir.",
    ]
    parts.append(closers[v])
    return " ".join(parts)


def main():
    with open(PRODUCT_JSON, encoding="utf-8") as f:
        data = json.load(f)
    products = data.get("products", [])

    updated = 0
    renamed = []
    for product in products:
        old_name = product.get("name", "")
        new_name = clean_name(old_name)
        if new_name != old_name:
            product["name"] = new_name  # display name only — slug/URL untouched
            renamed.append((old_name, new_name))
        # keep image alt text in sync with the (cleaned) name
        if isinstance(product.get("image"), dict):
            product["image"]["altText"] = new_name
        for node in product.get("galleryImages", {}).get("nodes", []):
            node["altText"] = new_name

        # first run: harvest machine brands + business notes from the imported
        # (old-site) description before it is replaced; persisted for re-runs.
        original_desc = product.get("description") or ""
        if "machines" not in product:
            product["machines"] = extract_machines(f"{new_name} {original_desc}")
        if "descriptionNotes" not in product:
            product["descriptionNotes"] = extract_notes(original_desc)

        product["description"] = build_description(product)
        new_short = build_short(product)
        if product.get("shortDescription") != new_short:
            product["shortDescription"] = new_short
            updated += 1

    with open(PRODUCT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"enrich_product_content: {updated}/{len(products)} shortDescription, {len(renamed)} isim güncellendi.")
    for old, new in renamed:
        print(f"  isim: {old!r}\n     -> {new!r}")


if __name__ == "__main__":
    main()
