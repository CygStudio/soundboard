import { mount } from "@vue/test-utils";
import { nextTick } from "vue";

import PlaygroundPage from "../src/pages/PlaygroundPage.vue";

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
