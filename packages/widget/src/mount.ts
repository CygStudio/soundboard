import { createApp, h, reactive } from "vue";

import SoundboardWidget from "./SoundboardWidget.vue";

import type {
  MountedSoundboardWidget,
  MountSoundboardWidgetOptions,
} from "./types";

function resolveTarget(target: Element | string) {
  if (typeof target === "string") {
    const element = document.querySelector(target);

    if (element === null) {
      throw new Error(`Unable to find target element: ${target}`);
    }

    return element;
  }

  return target;
}

export function mountSoundboardWidget(
  target: Element | string,
  options: MountSoundboardWidgetOptions,
): MountedSoundboardWidget {
  const element = resolveTarget(target);
  const shadowRoot = element.shadowRoot ?? element.attachShadow({ mode: "open" });
  const props = reactive({ ...options });
  const stylesheet = document.createElement("link");
  const mountPoint = document.createElement("div");

  stylesheet.href = new URL("./styles.css", import.meta.url).href;
  stylesheet.rel = "stylesheet";

  shadowRoot.replaceChildren(stylesheet, mountPoint);

  const app = createApp({
    name: "MountedSoundboardWidgetRoot",
    render() {
      return h(SoundboardWidget, props);
    },
  });

  app.mount(mountPoint);

  return {
    unmount() {
      app.unmount();
      shadowRoot.replaceChildren();
    },
    update(nextOptions) {
      Object.assign(props, nextOptions);
    },
  };
}
