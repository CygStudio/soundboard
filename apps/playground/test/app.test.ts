import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import HenyaSoundboardPage from "../src/pages/HenyaSoundboardPage.vue";
import PlaygroundPage from "../src/pages/PlaygroundPage.vue";

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

describe("playground app", () => {
  test("switches variants and keeps Vue and Shadow DOM widgets in sync", async () => {
    const wrapper = mount(PlaygroundPage);

    expect(wrapper.text()).toContain("Streamer Mode");
    expect(wrapper.text()).toContain("Meow Hello");

    const mountHost = wrapper.get('[data-shadow-widget-host]').element as HTMLElement;

    expect(mountHost.shadowRoot?.textContent).toContain("Meow Hello");

    await wrapper.get('[data-variant-id="late-night-lab"]').trigger("click");
    await nextTick();

    expect(wrapper.text()).toContain("Late Night Lab");
    expect(wrapper.text()).toContain("Laugh Track");
    expect(wrapper.text()).toContain("Softer ambience, slower pacing, same reusable widget core.");
    expect(mountHost.shadowRoot?.textContent).toContain("Laugh Track");
    expect(mountHost.shadowRoot?.textContent).not.toContain("Meow Hello");
  });
});

describe("henya soundboard page", () => {
  test("restarts the current sound when a sound card is clicked while overlap is off", async () => {
    const wrapper = mount(HenyaSoundboardPage);
    const playButton = wrapper.get('[data-henya-play-id="dayo"]');

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
    const wrapper = mount(HenyaSoundboardPage);

    await wrapper.get('[title="Audio Overlap: Off"]').trigger("click");

    const playButton = wrapper.get('[data-henya-play-id="dayo"]');
    await playButton.trigger("click");
    await playButton.trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[0]!.pause).not.toHaveBeenCalled();

    await wrapper.get('[aria-label="Stop Dayo!"]').trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[0]!.pause).toHaveBeenCalledTimes(1);
    expect(mockAudioElements[1]!.pause).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[aria-label="Stop Dayo!"]').exists()).toBe(false);
  });
});
