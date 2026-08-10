#!/usr/bin/env python3
"""Validate Math List card source files without third-party dependencies."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CARDS_DIR = ROOT / "cards"
MANIFEST = CARDS_DIR / "manifest.json"
EXPECTED_COLUMNS = ["ID", "Front", "Back", "Speed", "Topic", "Tags"]
ALLOWED_SPEEDS = {"reflex", "fluent", "recognition"}


def validate_file(path: Path, seen_ids: dict[str, Path]) -> tuple[list[str], int]:
    errors: list[str] = []
    card_count = 0
    columns: list[str] | None = None
    data_lines: list[tuple[int, str]] = []

    with path.open("r", encoding="utf-8", newline="") as source:
        for line_number, raw_line in enumerate(source, start=1):
            line = raw_line.rstrip("\r\n")
            if not line:
                continue
            if line.startswith("#columns:"):
                columns = line.removeprefix("#columns:").split("\t")
            elif not line.startswith("#"):
                data_lines.append((line_number, line))

    if columns != EXPECTED_COLUMNS:
        errors.append(
            f"{path}: #columns must be exactly {EXPECTED_COLUMNS!r}; got {columns!r}"
        )

    for line_number, line in data_lines:
        try:
            row = next(csv.reader([line], delimiter="\t", strict=True))
        except csv.Error as exc:
            errors.append(f"{path}:{line_number}: invalid TSV: {exc}")
            continue

        if len(row) != len(EXPECTED_COLUMNS):
            errors.append(
                f"{path}:{line_number}: expected {len(EXPECTED_COLUMNS)} fields, "
                f"found {len(row)}"
            )
            continue

        card = dict(zip(EXPECTED_COLUMNS, row, strict=True))
        card_count += 1

        for field in EXPECTED_COLUMNS:
            if not card[field].strip():
                errors.append(f"{path}:{line_number}: {field} must not be blank")

        card_id = card["ID"]
        if card_id in seen_ids:
            errors.append(
                f"{path}:{line_number}: duplicate ID {card_id!r}; "
                f"first seen in {seen_ids[card_id]}"
            )
        else:
            seen_ids[card_id] = path

        speed = card["Speed"]
        if speed not in ALLOWED_SPEEDS:
            errors.append(
                f"{path}:{line_number}: Speed must be one of "
                f"{sorted(ALLOWED_SPEEDS)!r}; got {speed!r}"
            )

        tags = card["Tags"].split()
        if speed and speed not in tags:
            errors.append(
                f"{path}:{line_number}: Tags must include speed class {speed!r}"
            )

    if card_count == 0:
        errors.append(f"{path}: contains no cards")

    return errors, card_count


def main() -> int:
    files = sorted(CARDS_DIR.rglob("*.txt"))
    if not files:
        print("No card files found.", file=sys.stderr)
        return 1

    all_errors: list[str] = []
    seen_ids: dict[str, Path] = {}
    total_cards = 0

    try:
        manifest_data = json.loads(MANIFEST.read_text(encoding="utf-8"))
        manifest_files = manifest_data["files"]
        if not isinstance(manifest_files, list) or not all(
            isinstance(item, str) for item in manifest_files
        ):
            raise ValueError("'files' must be a list of paths")
    except (OSError, json.JSONDecodeError, KeyError, ValueError) as exc:
        all_errors.append(f"{MANIFEST}: invalid manifest: {exc}")
        manifest_files = []

    expected_manifest_files = [path.relative_to(ROOT).as_posix() for path in files]
    if sorted(manifest_files) != expected_manifest_files:
        all_errors.append(
            f"{MANIFEST}: files must match the card sources; expected "
            f"{expected_manifest_files!r}, got {manifest_files!r}"
        )

    for path in files:
        errors, card_count = validate_file(path, seen_ids)
        all_errors.extend(errors)
        total_cards += card_count

    if all_errors:
        print("Card validation failed:", file=sys.stderr)
        for error in all_errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Validated {total_cards} cards across {len(files)} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
