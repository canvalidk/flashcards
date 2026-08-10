export function parseCardFile(text, path) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const columnsLine = lines.find((line) => line.startsWith("#columns:"));
  if (!columnsLine) {
    throw new Error(`${path} does not declare its columns.`);
  }

  const columns = columnsLine.slice("#columns:".length).split("\t");
  const cards = [];

  for (const line of lines) {
    if (!line || line.startsWith("#")) continue;

    const values = line.split("\t");
    if (values.length !== columns.length) {
      throw new Error(`${path} contains a row with the wrong number of fields.`);
    }

    const row = Object.fromEntries(columns.map((column, index) => [column, values[index]]));
    const tags = row.Tags.split(/\s+/).filter(Boolean);
    const family = tags.find((tag) => ["differentiation", "integration"].includes(tag))
      ?? row.Topic;

    cards.push({
      id: row.ID,
      front: row.Front,
      back: row.Back,
      speed: row.Speed,
      topic: row.Topic,
      tags,
      family,
    });
  }

  return cards;
}

export function titleCase(value) {
  return value.replace(/(^|[-_])([a-z])/g, (_, separator, letter) =>
    `${separator ? " " : ""}${letter.toUpperCase()}`,
  );
}
