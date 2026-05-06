import { mount } from "@vue/test-utils";

import { PlaybackControls, SoundItemCard } from "../src";

describe("PlaybackControls", () => {
  test("renders overlap, loop, random, and stop-all controls", () => {
    const wrapper = mount(PlaybackControls, {
      props: {
        allowOverlap: false,
        canStopAll: false,
        loopEnabled: false,
      },
    });

    expect(wrapper.text()).toContain("Overlap");
    expect(wrapper.text()).toContain("Loop");
    expect(wrapper.text()).toContain("Random");
    expect(wrapper.text()).toContain("Stop all");
    expect(wrapper.get('button[data-action="stop-all"]').attributes("disabled")).toBeDefined();
  });
});

describe("SoundItemCard", () => {
  test("renders badge metadata and emits toggle-play", async () => {
    const wrapper = mount(SoundItemCard, {
      props: {
        isActive: false,
        item: {
          id: "intro",
          categoryId: "openers",
          title: "Meow Hello",
          description: "A short intro cue.",
          audioUrl: "/audio/meow-hello.ogg",
          badge: "Intro",
        },
      },
    });

    expect(wrapper.text()).toContain("Intro");

    await wrapper.get('button[data-sound-id="intro"]').trigger("click");

    expect(wrapper.emitted("toggle-play")).toEqual([["intro"]]);
  });
});
