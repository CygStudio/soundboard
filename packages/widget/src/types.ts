import type { SoundboardInput } from "@soundboard/core";

export interface SoundboardWidgetProps {
  className?: string;
  soundboard: SoundboardInput;
}

export interface MountSoundboardWidgetOptions extends SoundboardWidgetProps {}

export interface MountedSoundboardWidget {
  unmount: () => void;
  update: (options: Partial<MountSoundboardWidgetOptions>) => void;
}
