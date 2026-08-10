import { parseCardFile, titleCase } from "./card-data.mjs";

const manifestUrl = new URL("./cards/manifest.json", import.meta.url);

const elements = {
  loading: document.querySelector("#loading-state"),
  cardArea: document.querySelector("#card-area"),
  empty: document.querySelector("#empty-state"),
  complete: document.querySelector("#complete-state"),
  error: document.querySelector("#error-message"),
  card: document.querySelector("#flashcard"),
  question: document.querySelector("#question-text"),
  answer: document.querySelector("#answer-text"),
  answerSide: document.querySelector("#answer-side"),
  speedChip: document.querySelector("#speed-chip"),
  topic: document.querySelector("#topic-label"),
  revealHint: document.querySelector("#reveal-hint"),
  revealActions: document.querySelector("#reveal-actions"),
  gradeActions: document.querySelector("#grade-actions"),
  revealButton: document.querySelector("#reveal-button"),
  againButton: document.querySelector("#again-button"),
  gotItButton: document.querySelector("#got-it-button"),
  shuffleButton: document.querySelector("#shuffle-button"),
  restartButton: document.querySelector("#restart-button"),
  clearFilters: document.querySelector("#clear-filters"),
  familyFilter: document.querySelector("#family-filter"),
  speedFilter: document.querySelector("#speed-filter"),
  position: document.querySelector("#position-label"),
  score: document.querySelector("#session-score"),
  progressTrack: document.querySelector("#progress-track"),
  progressBar: document.querySelector("#progress-bar"),
  libraryCount: document.querySelector("#library-count"),
  completeTitle: document.querySelector("#complete-title"),
  completeCopy: document.querySelector("#complete-copy"),
  announcer: document.querySelector("#announcer"),
};

const state = {
  allCards: [],
  queue: [],
  index: 0,
  revealed: false,
  fluent: 0,
  again: 0,
};

async function loadCards() {
  const manifestResponse = await fetch(manifestUrl);
  if (!manifestResponse.ok) throw new Error("The card manifest could not be opened.");
  const manifest = await manifestResponse.json();

  const files = await Promise.all(
    manifest.files.map(async (path) => {
      const response = await fetch(new URL(path, document.baseURI));
      if (!response.ok) throw new Error(`${path} could not be opened.`);
      return parseCardFile(await response.text(), path);
    }),
  );

  return files.flat();
}

function shuffle(cards) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function populateFilters() {
  const families = [...new Set(state.allCards.map((card) => card.family))].sort();
  for (const family of families) {
    const option = document.createElement("option");
    option.value = family;
    option.textContent = titleCase(family);
    elements.familyFilter.append(option);
  }
}

function currentFilters() {
  return {
    family: elements.familyFilter.value,
    speed: elements.speedFilter.value,
  };
}

function filteredCards() {
  const { family, speed } = currentFilters();
  return state.allCards.filter(
    (card) =>
      (family === "all" || card.family === family)
      && (speed === "all" || card.speed === speed),
  );
}

function resetSession({ shouldShuffle = false } = {}) {
  const cards = filteredCards();
  state.queue = shouldShuffle ? shuffle(cards) : [...cards];
  state.index = 0;
  state.revealed = false;
  state.fluent = 0;
  state.again = 0;
  render();
}

function setProgress(current, total) {
  const percentage = total === 0 ? 0 : Math.round((current / total) * 100);
  elements.progressBar.style.width = `${percentage}%`;
  elements.progressTrack.setAttribute("aria-valuenow", String(percentage));
}

function render() {
  elements.loading.hidden = true;
  elements.error.hidden = true;
  elements.cardArea.hidden = true;
  elements.empty.hidden = true;
  elements.complete.hidden = true;

  elements.score.textContent = `${state.fluent} fluent · ${state.again} again`;

  if (state.queue.length === 0) {
    elements.empty.hidden = false;
    elements.position.textContent = "No matching cards";
    setProgress(0, 0);
    return;
  }

  if (state.index >= state.queue.length) {
    elements.complete.hidden = false;
    elements.position.textContent = `Completed ${state.queue.length} reviews`;
    setProgress(state.queue.length, state.queue.length);
    elements.completeTitle.textContent = state.again === 0
      ? "Clean and immediate."
      : "The stack is clear.";
    elements.completeCopy.textContent = state.again === 0
      ? `All ${state.fluent} responses met the speed standard.`
      : `${state.fluent} fluent responses and ${state.again} retries. Cards marked Again were returned to the stack.`;
    return;
  }

  const card = state.queue[state.index];
  elements.cardArea.hidden = false;
  elements.question.textContent = card.front;
  elements.answer.textContent = card.back;
  elements.speedChip.textContent = titleCase(card.speed);
  elements.topic.textContent = titleCase(card.family);
  elements.position.textContent = `Card ${state.index + 1} of ${state.queue.length}`;
  setProgress(state.index, state.queue.length);

  elements.card.classList.toggle("is-revealed", state.revealed);
  elements.answerSide.setAttribute("aria-hidden", String(!state.revealed));
  elements.revealActions.hidden = state.revealed;
  elements.gradeActions.hidden = !state.revealed;
  elements.revealHint.textContent = state.revealed ? "Answer shown" : "Tap the card or press Space";
  elements.card.setAttribute(
    "aria-label",
    state.revealed
      ? "Answer revealed; press 1 for Again or 2 for Fluent"
      : "Flashcard; press Space to reveal the answer",
  );
}

function reveal() {
  if (state.revealed || state.index >= state.queue.length) return;
  state.revealed = true;
  render();
  elements.announcer.textContent = `Answer: ${state.queue[state.index].back}`;
}

function grade(result) {
  if (!state.revealed || state.index >= state.queue.length) return;

  const card = state.queue[state.index];
  if (result === "again") {
    state.again += 1;
    const returnAt = Math.min(state.index + 3, state.queue.length);
    state.queue.splice(returnAt, 0, card);
  } else {
    state.fluent += 1;
  }

  state.index += 1;
  state.revealed = false;
  render();
  elements.announcer.textContent = result === "again"
    ? "Marked Again. The card will return shortly."
    : "Marked Fluent.";
}

function clearFilters() {
  elements.familyFilter.value = "all";
  elements.speedFilter.value = "all";
  resetSession();
}

elements.revealButton.addEventListener("click", reveal);
elements.card.addEventListener("click", reveal);
elements.againButton.addEventListener("click", () => grade("again"));
elements.gotItButton.addEventListener("click", () => grade("fluent"));
elements.shuffleButton.addEventListener("click", () => resetSession({ shouldShuffle: true }));
elements.restartButton.addEventListener("click", () => resetSession({ shouldShuffle: true }));
elements.clearFilters.addEventListener("click", clearFilters);
elements.familyFilter.addEventListener("change", () => resetSession());
elements.speedFilter.addEventListener("change", () => resetSession());

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement) return;

  if (event.code === "Space") {
    event.preventDefault();
    reveal();
  } else if (event.key === "1" || event.key === "ArrowLeft") {
    grade("again");
  } else if (event.key === "2" || event.key === "ArrowRight") {
    grade("fluent");
  }
});

try {
  state.allCards = await loadCards();
  populateFilters();
  elements.libraryCount.textContent = `${state.allCards.length} cards · Git-backed`;
  resetSession({ shouldShuffle: true });
} catch (error) {
  elements.loading.hidden = true;
  elements.error.hidden = false;
  elements.error.textContent = error instanceof Error
    ? `The card library could not be loaded: ${error.message}`
    : "The card library could not be loaded.";
}
