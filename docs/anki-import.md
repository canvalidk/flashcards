# Importing into Anki

The card files are ready for Anki's text importer. They use UTF-8 text, tab
separators, and supported file headers to describe their columns.

## First import

1. In Anki, create a note type named **Math List** with these fields, in order:
   `ID`, `Front`, `Back`, `Speed`, and `Topic`.
2. Give that note type a card template that shows `Front` on the question side
   and `Back` on the answer side. `Speed` can also be displayed as a small cue.
3. Select **File -> Import** and choose a card file, such as
   `cards/calculus/differentiation.txt`.
4. Select the **Math List** note type.
5. Confirm the five ordinary columns map to the five note fields. The sixth
   column is declared as Anki tags by the file header.
6. Import. The header presets the destination deck to
   `Math List::Calculus`.

The stable `ID` is deliberately the first note field. Anki uses the first field
for duplicate detection, so later imports can update a note without discarding
its scheduling history. Do not change an existing card's ID.

## Review rule

- `reflex`: noticeable hesitation means **Again**, even if the final answer was
  correct.
- `fluent`: pass only when the operation was comfortable and controlled.
- `recognition`: pass only when the relevant tool or approach was identified
  promptly.

The deck trains response latency, not merely eventual recall.

## Source of truth

Edit the files in this repository, validate them, commit the changes, and then
import them into Anki. Avoid making Anki the only place where card wording is
stored.

Reference: [Anki Manual - Importing Text Files](https://docs.ankiweb.net/importing/text-files.html)
