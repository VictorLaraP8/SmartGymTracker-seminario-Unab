#!/usr/bin/env python3
"""
Elimina píxeles casi negros aislados (ruido/grunge) sobre fondo claro en el logo PNG,
sin tocar el azul del texto (suele tener canal B alto).
"""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image


def local_mean_luma(gray: np.ndarray, k: int = 9) -> np.ndarray:
    """Promedio local de luminancia (gray float 0–255)."""
    pad = k // 2
    g = np.pad(gray, pad, mode="edge")
    acc = np.zeros_like(gray, dtype=np.float64)
    for di in range(k):
        for dj in range(k):
            acc += g[di : di + gray.shape[0], dj : dj + gray.shape[1]]
    return acc / (k * k)


def clean_speckles(
    rgba: np.ndarray,
    max_channel_dark: float = 48.0,
    mean_luma_bright: float = 178.0,
    replacement: tuple[float, float, float] = (255.0, 255.0, 255.0),
) -> np.ndarray:
    rgb = rgba[:, :, :3].astype(np.float64)
    alpha = rgba[:, :, 3:4].astype(np.float64)

    mx = rgb.max(axis=2)
    luma = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    neigh = local_mean_luma(luma, k=9)

    # Ruido: casi negro en todos los canales, pero entorno claro (huecos entre letras).
    speckle = (mx < max_channel_dark) & (neigh > mean_luma_bright)

    out = rgb.copy()
    for c in range(3):
        out[:, :, c] = np.where(speckle, replacement[c], rgb[:, :, c])

    return np.concatenate([out, alpha], axis=2).clip(0, 255).astype(np.uint8)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    logo = root / "mobile-app" / "assets" / "images" / "smartgym-tracker-logo.png"
    if not logo.exists():
        print("No existe:", logo, file=sys.stderr)
        return 1

    im = Image.open(logo).convert("RGBA")
    arr = np.array(im)
    cleaned = clean_speckles(arr)
    backup = logo.with_suffix(".bak.png")
    if not backup.exists():
        backup.write_bytes(logo.read_bytes())
    Image.fromarray(cleaned, mode="RGBA").save(logo, format="PNG", compress_level=6)
    print("Guardado:", logo, "| backup:", backup)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
