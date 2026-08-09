# Card design rules

## Inclusion test

Add a card when being slow at the underlying move would interrupt physics
reasoning. A card does not belong merely because its topic appears in a maths
course.

## Design principles

1. Target a micro-hesitation.
2. Ask for one mathematical move at a time.
3. Prefer concrete variants over broad explanations.
4. Mix visually similar operations that are easy to confuse.
5. Make the expected speed explicit.
6. Give one unambiguous canonical answer.

For example, do not stop after one abstract power-rule card. Include mixed
differentiation and integration prompts with positive, negative, and fractional
powers so that the direction of the operation becomes automatic.

## Adding a card

1. Choose the closest topic file or create a new one using the same headers.
2. Assign a stable, descriptive ID.
3. Add exactly six tab-separated values.
4. Use one of the three allowed speed classes.
5. Add space-separated tags, including the speed class.
6. Run `python scripts/validate_cards.py`.
