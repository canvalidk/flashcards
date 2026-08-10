# Card source

Each `.txt` file in this directory is a UTF-8, tab-delimited Anki import file.
The comment headers at the top configure the separator, columns, destination
deck, and tags column. They are part of the file format and should be retained.

Write inline mathematics as TeX between `\(` and `\)`, for example
`\(\frac{x^{n+1}}{n+1}+C\)`. Use `\[` and `\]` only when an expression should
occupy its own line. The website and Anki render the same notation with
MathJax.

Keep related prompts together in a topic file. Card IDs must be unique across
the entire repository and should follow this pattern:

```text
<area>_<operation>_<number>
```

Examples: `poly_diff_001`, `poly_int_004`.

See [card-design.md](../docs/card-design.md) before adding a new family of
cards.
