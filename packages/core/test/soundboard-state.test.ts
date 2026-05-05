import {
  createSoundboardState,
  selectSoundboardCategory,
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
    expect(state.activeItemId).toBeNull();
    expect(state.visibleItems.map((item) => item.id)).toEqual(["rain", "wind"]);
  });

  test("switches categories and clears an active item that no longer belongs to the category", () => {
    const initialState = createSoundboardState(soundboard);
    const activeState = toggleActiveSound(soundboard, initialState, "rain");

    const nextState = selectSoundboardCategory(soundboard, activeState, "alerts");

    expect(nextState.activeCategoryId).toBe("alerts");
    expect(nextState.activeItemId).toBeNull();
    expect(nextState.visibleItems.map((item) => item.id)).toEqual(["ping"]);
  });

  test("keeps only one active sound at a time and toggles the same item off", () => {
    const initialState = createSoundboardState(soundboard);
    const firstActive = toggleActiveSound(soundboard, initialState, "rain");
    const secondActive = toggleActiveSound(soundboard, firstActive, "wind");
    const toggledOff = toggleActiveSound(soundboard, secondActive, "wind");

    expect(firstActive.activeItemId).toBe("rain");
    expect(secondActive.activeItemId).toBe("wind");
    expect(toggledOff.activeItemId).toBeNull();
  });
});
