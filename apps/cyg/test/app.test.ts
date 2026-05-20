import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import CygSoundboardPage from "../src/pages/CygSoundboardPage.vue";

class MockAudioElement {
  currentTime = 0;
  duration = 2;
  loop = false;

  readonly play = vi.fn<() => Promise<void>>(() => Promise.resolve());
  readonly pause = vi.fn<() => void>();

  constructor(readonly src: string) {
    mockAudioElements.push(this);
  }

  addEventListener(): void {}
}

let mockAudioElements: MockAudioElement[] = [];

async function settleAudioPlayback() {
  await Promise.resolve();
  await nextTick();
}

beforeEach(() => {
  mockAudioElements = [];
  vi.stubGlobal("Audio", MockAudioElement);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("cyg soundboard page", () => {
  test("renders the dragon celebration design surface", () => {
    const wrapper = mount(CygSoundboardPage);

    expect(wrapper.text()).toContain("Dragon Celebration");
    expect(wrapper.text()).toContain("Dragon Birthday");
    expect(wrapper.text()).toContain("All Sparks");
    expect(wrapper.text()).toContain("Firecracker Roar");
  });

  test("restarts the current sound when a sound card is clicked while overlap is off", async () => {
    const wrapper = mount(CygSoundboardPage);
    const playButton = wrapper.get('[data-cyg-play-id="firecracker-roar"]');

    await playButton.trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(1);
    const firstAudio = mockAudioElements[0]!;
    firstAudio.currentTime = 1;

    await playButton.trigger("click");
    await settleAudioPlayback();

    expect(firstAudio.pause).toHaveBeenCalledTimes(1);
    expect(firstAudio.currentTime).toBe(0);
    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[1]!.play).toHaveBeenCalledTimes(1);
  });

  test("overlaps repeated card clicks and stops a sound only from its stop button", async () => {
    const wrapper = mount(CygSoundboardPage);

    await wrapper.get('[title="Audio Overlap: Off"]').trigger("click");

    const playButton = wrapper.get('[data-cyg-play-id="firecracker-roar"]');
    await playButton.trigger("click");
    await playButton.trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[0]!.pause).not.toHaveBeenCalled();

    await wrapper.get('[aria-label="Stop Firecracker Roar"]').trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[0]!.pause).toHaveBeenCalledTimes(1);
    expect(mockAudioElements[1]!.pause).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[aria-label="Stop Firecracker Roar"]').exists()).toBe(false);
  });
});
