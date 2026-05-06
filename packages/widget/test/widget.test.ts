import { mount } from "@vue/test-utils";

import {
  SoundboardWidget,
  mountSoundboardWidget,
  type MountSoundboardWidgetOptions,
} from "../src";

class MockAudio {
  static instances: MockAudio[] = [];

  currentTime = 0;
  loop = false;
  paused = true;
  play = vi.fn<() => Promise<void>>(async () => {
    this.paused = false;
  });
  pause = vi.fn<() => void>(() => {
    this.paused = true;
  });
  src: string;

  constructor(src = "") {
    this.src = src;
    MockAudio.instances.push(this);
  }

  addEventListener() {}

  removeEventListener() {}
}

const soundboard = {
  categories: [
    { id: "ambience", label: "Ambience" },
    { id: "alerts", label: "Alerts" },
  ],
  items: [
    {
      id: "rain",
      categoryId: "ambience",
      title: "Rain",
      description: "Soft rain loop",
      audioUrl: "https://example.com/rain.mp3",
    },
    {
      id: "wind",
      categoryId: "ambience",
      title: "Wind",
      description: "Cold wind loop",
      audioUrl: "https://example.com/wind.mp3",
    },
    {
      id: "ping",
      categoryId: "alerts",
      title: "Ping",
      description: "Short ping alert",
      audioUrl: "https://example.com/ping.mp3",
    },
  ],
} satisfies MountSoundboardWidgetOptions["soundboard"];

describe("SoundboardWidget", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("renders categories and the active category items on first paint", () => {
    const wrapper = mount(SoundboardWidget, {
      props: {
        soundboard,
      },
    });

    expect(wrapper.get('button[aria-pressed="true"]').text()).toBe("Ambience");
    expect(wrapper.text()).toContain("Rain");
    expect(wrapper.text()).toContain("Wind");
    expect(wrapper.text()).not.toContain("Ping");
    expect(wrapper.text()).toContain("Overlap");
    expect(wrapper.text()).toContain("Stop all");
  });

  test("switches categories without leaving the widget context", async () => {
    const wrapper = mount(SoundboardWidget, {
      props: {
        soundboard,
      },
    });

    await wrapper.get('button[data-category-id="alerts"]').trigger("click");

    expect(wrapper.get('button[aria-pressed="true"]').text()).toBe("Alerts");
    expect(wrapper.text()).toContain("Ping");
    expect(wrapper.text()).not.toContain("Rain");
  });

  test("keeps only one sound active and toggles the current item off", async () => {
    const wrapper = mount(SoundboardWidget, {
      props: {
        soundboard,
      },
    });

    await wrapper.get('button[data-sound-id="rain"]').trigger("click");
    await wrapper.get('button[data-sound-id="wind"]').trigger("click");
    await wrapper.get('button[data-sound-id="wind"]').trigger("click");

    expect(MockAudio.instances).toHaveLength(2);
    expect(MockAudio.instances[0]?.pause).toHaveBeenCalledTimes(1);
    expect(wrapper.find('[data-sound-id="rain"][aria-pressed="true"]').exists()).toBe(false);
    expect(wrapper.find('[data-sound-id="wind"][aria-pressed="true"]').exists()).toBe(false);
  });

  test("plays multiple sounds when overlap is enabled", async () => {
    const wrapper = mount(SoundboardWidget, {
      props: {
        soundboard,
      },
    });

    await wrapper.get('[data-action="toggle-overlap"]').trigger("click");
    await wrapper.get('button[data-sound-id="rain"]').trigger("click");
    await wrapper.get('button[data-sound-id="wind"]').trigger("click");

    expect(wrapper.findAll('[data-sound-id][aria-pressed="true"]')).toHaveLength(2);
    expect(MockAudio.instances[0]?.pause).not.toHaveBeenCalled();
    expect(MockAudio.instances[1]?.play).toHaveBeenCalledTimes(1);
  });

  test("forwards loop mode to newly created audio elements", async () => {
    const wrapper = mount(SoundboardWidget, {
      props: {
        soundboard,
      },
    });

    await wrapper.get('[data-action="toggle-loop"]').trigger("click");
    await wrapper.get('button[data-sound-id="rain"]').trigger("click");

    expect(MockAudio.instances[0]?.loop).toBe(true);
  });

  test("plays a random visible sound and stops all active playback", async () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.75);
    const wrapper = mount(SoundboardWidget, {
      props: {
        soundboard,
      },
    });

    await wrapper.get('[data-action="play-random"]').trigger("click");

    expect(wrapper.find('[data-sound-id="wind"][aria-pressed="true"]').exists()).toBe(true);
    expect(wrapper.get('[data-action="stop-all"]').attributes("disabled")).toBeUndefined();

    await wrapper.get('[data-action="stop-all"]').trigger("click");

    expect(wrapper.findAll('[data-sound-id][aria-pressed="true"]')).toHaveLength(0);
    expect(MockAudio.instances[0]?.pause).toHaveBeenCalledTimes(1);

    randomSpy.mockRestore();
  });
});

describe("mountSoundboardWidget", () => {
  beforeEach(() => {
    MockAudio.instances = [];
    vi.stubGlobal("Audio", MockAudio);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test("mounts the widget into a shadow root and cleans it up on unmount", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);

    const mounted = mountSoundboardWidget(target, {
      soundboard,
    });

    expect(target.shadowRoot).not.toBeNull();
    expect(target.shadowRoot?.textContent).toContain("Ambience");

    mounted.unmount();

    expect(target.shadowRoot?.textContent?.trim()).toBe("");
  });
});
