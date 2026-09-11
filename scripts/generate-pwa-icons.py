#!/usr/bin/env python3
"""Rasterize the door wordmark into PWA PNG icons (stdlib only)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

BG = (0x1C, 0x19, 0x14)
GOLD = (0xE8, 0xB8, 0x6D)
ROOT = Path(__file__).resolve().parents[1]


def write_png(path: Path, width: int, height: int, rgb: bytearray) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    raw = bytearray()
    stride = width * 3
    for y in range(height):
        raw.append(0)
        raw.extend(rgb[y * stride : (y + 1) * stride])
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )


def fill_rect(
    buf: bytearray, size: int, x0: int, y0: int, x1: int, y1: int, color: tuple[int, int, int]
) -> None:
    x0, x1 = max(0, min(x0, x1)), min(size, max(x0, x1))
    y0, y1 = max(0, min(y0, y1)), min(size, max(y0, y1))
    r, g, b = color
    for y in range(y0, y1):
        row = y * size * 3
        for x in range(x0, x1):
            i = row + x * 3
            buf[i] = r
            buf[i + 1] = g
            buf[i + 2] = b


def fill_circle(
    buf: bytearray, size: int, cx: float, cy: float, radius: float, color: tuple[int, int, int]
) -> None:
    r, g, b = color
    rr = radius * radius
    x0, x1 = max(0, int(cx - radius) - 1), min(size, int(cx + radius) + 2)
    y0, y1 = max(0, int(cy - radius) - 1), min(size, int(cy + radius) + 2)
    for y in range(y0, y1):
        dy = y + 0.5 - cy
        row = y * size * 3
        for x in range(x0, x1):
            dx = x + 0.5 - cx
            if dx * dx + dy * dy <= rr:
                i = row + x * 3
                buf[i] = r
                buf[i + 1] = g
                buf[i + 2] = b


def stroke_round_rect(
    buf: bytearray,
    size: int,
    x: float,
    y: float,
    w: float,
    h: float,
    radius: float,
    stroke: float,
    color: tuple[int, int, int],
) -> None:
    """Approximate a rounded-rect stroke with inner/outer coverage."""
    r, g, b = color
    x0, y0, x1, y1 = x, y, x + w, y + h
    half = stroke / 2
    outer_pad = half + 1
    ix0, iy0 = int(x0 - outer_pad), int(y0 - outer_pad)
    ix1, iy1 = int(x1 + outer_pad) + 1, int(y1 + outer_pad) + 1
    for py in range(max(0, iy0), min(size, iy1)):
        cy = py + 0.5
        row = py * size * 3
        for px in range(max(0, ix0), min(size, ix1)):
            cx = px + 0.5
            # Distance to rounded rect (signed: negative inside)
            dx = abs(cx - (x0 + w / 2)) - (w / 2 - radius)
            dy = abs(cy - (y0 + h / 2)) - (h / 2 - radius)
            ox, oy = max(dx, 0.0), max(dy, 0.0)
            dist = (ox * ox + oy * oy) ** 0.5 + min(max(dx, dy), 0.0) - radius
            if abs(dist) <= half + 0.35:
                i = row + px * 3
                buf[i] = r
                buf[i + 1] = g
                buf[i + 2] = b


def paint_mark(buf: bytearray, size: int, inset_ratio: float) -> None:
    pad = size * inset_ratio
    inner = size - 2 * pad
    scale = inner / 32.0

    def sx(v: float) -> float:
        return pad + v * scale

    def sy(v: float) -> float:
        return pad + v * scale

    stroke = max(1.6 * scale, size / 64)
    radius = 1.5 * scale
    stroke_round_rect(buf, size, sx(3), sy(5), 12 * scale, 22 * scale, radius, stroke, GOLD)
    stroke_round_rect(buf, size, sx(17), sy(5), 12 * scale, 22 * scale, radius, stroke, GOLD)
    knob = max(1.1 * scale, size / 80)
    fill_circle(buf, size, sx(12.2), sy(16), knob, GOLD)
    fill_circle(buf, size, sx(19.8), sy(16), knob, GOLD)
    # Door transoms
    fill_rect(
        buf,
        size,
        int(sx(8)),
        int(sy(8) - stroke / 2),
        int(sx(12)),
        int(sy(8) + stroke / 2) + 1,
        GOLD,
    )
    fill_rect(
        buf,
        size,
        int(sx(20)),
        int(sy(8) - stroke / 2),
        int(sx(24)),
        int(sy(8) + stroke / 2) + 1,
        GOLD,
    )


def make_icon(size: int, *, maskable: bool) -> bytearray:
    buf = bytearray(size * size * 3)
    fill_rect(buf, size, 0, 0, size, size, BG)
    # Maskable safe zone is ~80%; any-purpose icons can fill more of the canvas.
    inset = 0.18 if maskable else 0.10
    paint_mark(buf, size, inset)
    return buf


def main() -> None:
    public = ROOT / "public"
    icons = public / "icons"
    icons.mkdir(parents=True, exist_ok=True)
    specs = [
        (icons / "icon-192.png", 192, False),
        (icons / "icon-512.png", 512, False),
        (icons / "icon-192-maskable.png", 192, True),
        (icons / "icon-512-maskable.png", 512, True),
        (public / "apple-touch-icon.png", 180, False),
    ]
    for path, size, maskable in specs:
        write_png(path, size, size, make_icon(size, maskable=maskable))
        print(f"wrote {path.relative_to(ROOT)} ({size}x{size})")


if __name__ == "__main__":
    main()
