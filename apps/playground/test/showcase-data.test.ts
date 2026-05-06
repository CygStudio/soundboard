import { describe, expect, test } from "vitest";

import { showcaseVariants } from "../src/showcase/showcaseContent";
import { toSoundboardInput } from "../src/showcase/toSoundboardInput";

describe("showcase content", () => {
  test("defines multiple selectable variants", () => {
    expect(showcaseVariants.length).toBeGreaterThan(1);
    expect(showcaseVariants.map((variant) => variant.id)).toEqual([
      "streamer-mode",
      "late-night-lab",
    ]);
  });

  test("maps the active variant into widget-ready local audio input", () => {
    const soundboard = toSoundboardInput(showcaseVariants[0]!);

    expect(soundboard.categories.length).toBeGreaterThan(0);
    expect(soundboard.items.length).toBeGreaterThan(0);
    expect(soundboard.items[0]?.badge).toBe("Intro");
    expect(soundboard.items.every((item) => item.audioUrl.startsWith("/audio/"))).toBe(
      true,
    );
  });
});
