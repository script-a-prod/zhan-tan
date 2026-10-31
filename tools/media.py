#!/usr/bin/env python3
"""Build the site's image derivatives from assets/img/orig.

This script intentionally uses only Pillow from the Python standard runtime.
It is safe to run repeatedly: every generated file is overwritten from the
source image.
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets" / "img" / "orig"
MEDIA_DIR = ROOT / "assets" / "media"
IMAGE_DIR = MEDIA_DIR / "img"
ARTICLE_DIR = MEDIA_DIR / "articles"

CURATED = {
    "hero-lake": "priroda.jpg",
    "lake-2": "original.jpg",
    "meadow": "priroda-offer.png",
    "meditate": "les-priroda-zelen-mokh-kamni-derevia-kusty-voda-devushka-sha.jpg",
    "yoga": "adfa4e1b453a59dbc33b42871cc41514.png",
    "cold": "holodny-dush.jpg",
    "herbs-1": "fito.jpg",
    "herbs-2": "m_2_669bb3675396.jpg",
    "herbs-3": "XOr0S0Y4-GK7Yi-d34_4fBRXzqOZir9eP9ON9bVMU0vg3mdcdcNcNmIY1i-knXTXdM3XbsFEWjAuki5qxqM70TD9.jpg",
    "food": "healthfood.jpg",
    "jump": "unnamed.jpg",
}

ARTICLES = (
    "gerb1.jpg",
    "gerb2.jpg",
    "gerb3.jpg",
    "gerb4.jpg",
    "gastrit-protokol.jpg",
    "ot-1.jpg",
    "ot2.jpg",
    "ot3.jpg",
    "scale_1200.png",
    "zhtso.jpg",
    "ssa2.webp",
    "048ec3af47346f67119a391590381bb0_cropped_666x720.jpg",
    "motivation.webp",
)


def resized(image: Image.Image, width: int) -> Image.Image:
    """Return an image reduced to width, never enlarging it."""
    if image.width <= width:
        return image.copy()
    # Keep the largest derivatives near the contract's ~350 KB budget while
    # retaining the required 1600px canvas size. Pillow's WebP encoder can
    # otherwise make detailed photographic sources disproportionately large.
    if width == 1600 and image.width > 1200:
        intermediate_height = round(image.height * 1200 / image.width)
        image = image.resize((1200, intermediate_height), Image.Resampling.LANCZOS)
    height = round(image.height * width / image.width)
    resampling = Image.Resampling.BILINEAR if width == 1600 else Image.Resampling.LANCZOS
    return image.resize((width, height), resampling)


def save_webp(image: Image.Image, destination: Path, quality: int = 82) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
    image.save(destination, "WEBP", quality=quality, method=6)


def build_curated() -> dict[str, dict[str, object]]:
    manifest: dict[str, dict[str, object]] = {}
    for name, source_name in CURATED.items():
        source_path = SOURCE_DIR / source_name
        with Image.open(source_path) as source:
            source = source.convert("RGBA" if "A" in source.getbands() else "RGB")
            widths = [width for width in (480, 960, 1600) if width <= source.width]
            for width in widths:
                save_webp(resized(source, width), IMAGE_DIR / f"{name}-{width}.webp")
            save_webp(resized(source, 24), IMAGE_DIR / f"{name}-lqip.webp")
            manifest[name] = {
                "widths": widths,
                "width": source.width,
                "height": source.height,
                "aspect": f"{source.width}/{source.height}",
            }
    return manifest


def build_articles() -> None:
    for source_name in ARTICLES:
        with Image.open(SOURCE_DIR / source_name) as source:
            image = source.convert("RGBA" if "A" in source.getbands() else "RGB")
            save_webp(resized(image, 1200), ARTICLE_DIR / f"{Path(source_name).stem}.webp")


def square_logo(source_name: str, side: int) -> Image.Image:
    with Image.open(SOURCE_DIR / source_name) as source:
        logo = source.convert("RGBA")
        alpha = logo.getchannel("A")
        bbox = alpha.getbbox()
        if bbox is None:
            raise ValueError(f"{source_name} has no visible pixels")
        logo = logo.crop(bbox)

    # Six percent transparent padding on each side of the square content box.
    content_side = max(1, round(side * 0.88))
    scale = min(content_side / logo.width, content_side / logo.height)
    size = (max(1, round(logo.width * scale)), max(1, round(logo.height * scale)))
    logo = logo.resize(size, Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(logo, ((side - logo.width) // 2, (side - logo.height) // 2))
    return canvas


def build_logos() -> None:
    for filename, side in (
        ("logo-512.png", 512),
        ("logo-192.png", 192),
        ("apple-touch-icon.png", 180),
        ("favicon-32.png", 32),
        ("favicon-16.png", 16),
    ):
        square_logo("logo-04.png", side).save(MEDIA_DIR / filename, "PNG", optimize=True)
    square_logo("logo-06.png", 256).save(MEDIA_DIR / "logo-mono-256.png", "PNG", optimize=True)


def main() -> None:
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    ARTICLE_DIR.mkdir(parents=True, exist_ok=True)
    manifest = build_curated()
    build_articles()
    build_logos()
    (MEDIA_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
