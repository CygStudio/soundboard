import {
  activateRandomSound,
  createSoundboardState,
  selectSoundboardCategory,
  stopAllSounds,
  toggleLoopPlayback,
  toggleOverlapPlayback,
  toggleActiveSound,
  type SoundboardInput,
} from "../src";

const soundboard: SoundboardInput = {
  categories: [
    { id: "ambience", label: "Ambience" },
    { id: "alerts", label: "Alerts" },
  ],
  items: [
    {
      id: "rain",
      categoryId: "ambience",
      title: "Rain",
      audioUrl: "https://example.com/rain.mp3",
    },
    {
      id: "wind",
      categoryId: "ambience",
      title: "Wind",
      audioUrl: "https://example.com/wind.mp3",
    },
    {
      id: "ping",
      categoryId: "alerts",
      title: "Ping",
      audioUrl: "https://example.com/ping.mp3",
    },
  ],
};

describe("soundboard state", () => {
  test("creates an initial state from the first available category", () => {
    const state = createSoundboardState(soundboard);

    expect(state.activeCategoryId).toBe("ambience");
    expect(state.activeItemIds).toEqual([]);
    expect(state.allowOverlap).toBe(false);
    expect(state.loopEnabled).toBe(false);
    expect(state.visibleItems.map((item) => item.id)).toEqual(["rain", "wind"]);
  });

  test("switches categories and clears active items that no longer belong to the category", () => {
    const initialState = createSoundboardState(soundboard);
    const activeState = toggleActiveSound(soundboard, initialState, "rain");

    const nextState = selectSoundboardCategory(soundboard, activeState, "alerts");

    expect(nextState.activeCategoryId).toBe("alerts");
    expect(nextState.activeItemIds).toEqual([]);
    expect(nextState.visibleItems.map((item) => item.id)).toEqual(["ping"]);
  });

  test("keeps only one active sound at a time and toggles the same item off", () => {
    const initialState = createSoundboardState(soundboard);
    const firstActive = toggleActiveSound(soundboard, initialState, "rain");
    const secondActive = toggleActiveSound(soundboard, firstActive, "wind");
    const toggledOff = toggleActiveSound(soundboard, secondActive, "wind");

    expect(firstActive.activeItemIds).toEqual(["rain"]);
    expect(secondActive.activeItemIds).toEqual(["wind"]);
    expect(toggledOff.activeItemIds).toEqual([]);
  });

  test("keeps multiple active sounds when overlap is enabled", () => {
    const initialState = createSoundboardState(soundboard);
    const overlapState = toggleOverlapPlayback(initialState);
    const firstActive = toggleActiveSound(soundboard, overlapState, "rain");
    const secondActive = toggleActiveSound(soundboard, firstActive, "wind");

    expect(overlapState.allowOverlap).toBe(true);
    expect(secondActive.activeItemIds).toEqual(["rain", "wind"]);
  });

  test("toggles loop playback independently from active sounds", () => {
    const initialState = createSoundboardState(soundboard);
    const loopState = toggleLoopPlayback(initialState);

    expect(loopState.loopEnabled).toBe(true);
    expect(loopState.activeItemIds).toEqual([]);
  });

  test("selects a random visible sound and can stop all playback", () => {
    const initialState = createSoundboardState(soundboard);
    const randomState = activateRandomSound(soundboard, initialState, 0.75);
    const stoppedState = stopAllSounds(randomState);

    expect(randomState.activeItemIds).toEqual(["wind"]);
    expect(stoppedState.activeItemIds).toEqual([]);
  });
});
