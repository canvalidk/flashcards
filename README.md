# Math List

Math List is a latency-first library of mathematical flashcards for physics.
It targets the small hesitations that interrupt higher-level reasoning: the
moment spent recalling which way a power changes, recognizing a standard
integral, choosing a projection, or spotting the right mathematical tool.

The guiding question is:

> Would being slow at this interrupt my physics reasoning?

If yes, it belongs here.

## Architecture

- **Git is the vault.** The canonical cards are ordinary UTF-8 text files.
- **Anki is the gym.** Import the text files for spaced, repeated practice.
- **AnkiWeb and local backups are extra copies.** They supplement Git rather
  than replace it.

The source remains searchable, reviewable, recoverable, and independent of any
single flashcard application.

## Performance classes

| Class | Standard |
| --- | --- |
| `reflex` | The response should be essentially immediate. Any noticeable hesitation is a fail. |
| `fluent` | Execute the move comfortably in roughly 10-30 seconds. |
| `recognition` | Rapidly identify the relevant tool, identity, or approach. |

For a `reflex` card, eventually reaching the right answer is not enough. If the
answer was slow, mark it **Again**.

## Repository layout

```text
cards/
  calculus/
    differentiation.txt
    integration.txt
docs/
  anki-import.md
  card-design.md
scripts/
  validate_cards.py
```

Future areas will include vectors, linear algebra, complex numbers, series,
differential equations, Fourier methods, coordinate transformations, and
dimensional checks. New areas should be added when real mathematical friction
reveals a need, rather than to imitate a curriculum.

## Card fields

Each tab-delimited file contains these columns:

| Field | Purpose |
| --- | --- |
| `ID` | Stable, unique identifier; kept first so Anki can update existing notes. |
| `Front` | One focused prompt. |
| `Back` | The canonical response. |
| `Speed` | `reflex`, `fluent`, or `recognition`. |
| `Topic` | Broad mathematical area. |
| `Tags` | Space-separated Anki tags. |

## Quick start

Validate the repository before importing or committing:

```powershell
python scripts/validate_cards.py
```

Then follow [the Anki import guide](docs/anki-import.md).
