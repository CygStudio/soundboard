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
  test("renders the dragon celebration design surface with real soundboard data", () => {
    const wrapper = mount(CygSoundboardPage);

    expect(wrapper.text()).toContain("Dragon Celebration System");
    expect(wrapper.text()).toContain("CYG 龍慶音效庫");
    expect(wrapper.text()).toContain("全部龍焰");
    expect(wrapper.text()).toContain("日常");
    expect(wrapper.text()).toContain("終於跟你們老闆見面啦 臭婚叫");
  });

  test("filters real data by search query", async () => {
    const wrapper = mount(CygSoundboardPage);

    await wrapper.get("[data-cyg-search-input]").setValue("立旗");
    await nextTick();

    expect(wrapper.text()).toContain("立旗不會清唱");
    expect(wrapper.text()).not.toContain("我是不會停的");
  });

  test("restarts the current sound when a sound card is clicked while overlap is off", async () => {
    const wrapper = mount(CygSoundboardPage);
    const playButton = wrapper.get('[data-cyg-play-id="A-6"]');

    await playButton.trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(1);
    const firstAudio = mockAudioElements[0]!;
    expect(firstAudio.src).toBe("/sounds-web/a-6.webm");
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

    const playButton = wrapper.get('[data-cyg-play-id="A-6"]');
    await playButton.trigger("click");
    await playButton.trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[0]!.pause).not.toHaveBeenCalled();

    await wrapper.get('[aria-label="Stop 我是不會停的"]').trigger("click");
    await settleAudioPlayback();

    expect(mockAudioElements).toHaveLength(2);
    expect(mockAudioElements[0]!.pause).toHaveBeenCalledTimes(1);
    expect(mockAudioElements[1]!.pause).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[aria-label="Stop 我是不會停的"]').exists()).toBe(false);
  });
});
