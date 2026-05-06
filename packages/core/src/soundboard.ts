export interface SoundboardCategory {
  id: string;
  label: string;
}

export interface SoundboardItem {
  id: string;
  categoryId: string;
  title: string;
  audioUrl: string;
  badge?: string;
  description?: string;
}

export interface SoundboardInput {
  categories: SoundboardCategory[];
  items: SoundboardItem[];
  initialCategoryId?: string;
  initialActiveItemId?: string;
}

export interface SoundboardState {
  activeCategoryId: string | null;
  activeItemIds: string[];
  allowOverlap: boolean;
  loopEnabled: boolean;
  visibleItems: SoundboardItem[];
}

function getCategoryById(input: SoundboardInput, categoryId: string) {
  return input.categories.find((category) => category.id === categoryId) ?? null;
}

function getItemById(input: SoundboardInput, itemId: string) {
  return input.items.find((item) => item.id === itemId) ?? null;
}

function getVisibleItems(input: SoundboardInput, categoryId: string | null) {
  if (categoryId === null) {
    return [];
  }

  return input.items.filter((item) => item.categoryId === categoryId);
}

function resolveInitialCategoryId(input: SoundboardInput) {
  if (
    input.initialCategoryId !== undefined &&
    getCategoryById(input, input.initialCategoryId) !== null
  ) {
    return input.initialCategoryId;
  }

  return input.categories[0]?.id ?? null;
}

function resolveInitialActiveItemIds(
  input: SoundboardInput,
  activeCategoryId: string | null,
) {
  if (input.initialActiveItemId === undefined) {
    return [];
  }

  const initialItem = getItemById(input, input.initialActiveItemId);

  if (initialItem === null || initialItem.categoryId !== activeCategoryId) {
    return [];
  }

  return [initialItem.id];
}

function ensureCategoryExists(input: SoundboardInput, categoryId: string) {
  if (getCategoryById(input, categoryId) === null) {
    throw new Error(`Unknown category id: ${categoryId}`);
  }
}

function ensureVisibleItemExists(input: SoundboardInput, categoryId: string | null, itemId: string) {
  const item = getItemById(input, itemId);

  if (item === null) {
    throw new Error(`Unknown item id: ${itemId}`);
  }

  if (item.categoryId !== categoryId) {
    throw new Error(`Item ${itemId} is not available in category ${categoryId ?? "none"}`);
  }

  return item;
}

export function createSoundboardState(input: SoundboardInput): SoundboardState {
  const activeCategoryId = resolveInitialCategoryId(input);

  return {
    activeCategoryId,
    activeItemIds: resolveInitialActiveItemIds(input, activeCategoryId),
    allowOverlap: false,
    loopEnabled: false,
    visibleItems: getVisibleItems(input, activeCategoryId),
  };
}

export function selectSoundboardCategory(
  input: SoundboardInput,
  state: SoundboardState,
  categoryId: string,
): SoundboardState {
  ensureCategoryExists(input, categoryId);

  const visibleItems = getVisibleItems(input, categoryId);
  const visibleItemIds = new Set(visibleItems.map((item) => item.id));
  const activeItemIds = state.activeItemIds.filter((itemId) =>
    visibleItemIds.has(itemId),
  );

  return {
    activeCategoryId: categoryId,
    activeItemIds,
    allowOverlap: state.allowOverlap,
    loopEnabled: state.loopEnabled,
    visibleItems,
  };
}

export function toggleActiveSound(
  input: SoundboardInput,
  state: SoundboardState,
  itemId: string,
): SoundboardState {
  ensureVisibleItemExists(input, state.activeCategoryId, itemId);

  const isActive = state.activeItemIds.includes(itemId);

  if (isActive) {
    return {
      activeCategoryId: state.activeCategoryId,
      activeItemIds: state.activeItemIds.filter((activeItemId) => activeItemId !== itemId),
      allowOverlap: state.allowOverlap,
      loopEnabled: state.loopEnabled,
      visibleItems: state.visibleItems,
    };
  }

  return {
    activeCategoryId: state.activeCategoryId,
    activeItemIds: state.allowOverlap ? [...state.activeItemIds, itemId] : [itemId],
    allowOverlap: state.allowOverlap,
    loopEnabled: state.loopEnabled,
    visibleItems: state.visibleItems,
  };
}

export function toggleOverlapPlayback(state: SoundboardState): SoundboardState {
  const allowOverlap = !state.allowOverlap;

  return {
    activeCategoryId: state.activeCategoryId,
    activeItemIds:
      allowOverlap || state.activeItemIds.length <= 1
        ? state.activeItemIds
        : state.activeItemIds.slice(-1),
    allowOverlap,
    loopEnabled: state.loopEnabled,
    visibleItems: state.visibleItems,
  };
}

export function toggleLoopPlayback(state: SoundboardState): SoundboardState {
  return {
    activeCategoryId: state.activeCategoryId,
    activeItemIds: state.activeItemIds,
    allowOverlap: state.allowOverlap,
    loopEnabled: !state.loopEnabled,
    visibleItems: state.visibleItems,
  };
}

export function activateRandomSound(
  input: SoundboardInput,
  state: SoundboardState,
  randomValue = Math.random(),
): SoundboardState {
  if (state.visibleItems.length === 0) {
    throw new Error("No visible items available for random playback");
  }

  const clampedRandomValue = Math.min(Math.max(randomValue, 0), 0.999999999999);
  const randomIndex = Math.floor(clampedRandomValue * state.visibleItems.length);
  const randomItemId = state.visibleItems[randomIndex]?.id;

  if (randomItemId === undefined) {
    throw new Error("Unable to resolve random sound item");
  }

  ensureVisibleItemExists(input, state.activeCategoryId, randomItemId);

  if (state.allowOverlap) {
    return {
      activeCategoryId: state.activeCategoryId,
      activeItemIds: state.activeItemIds.includes(randomItemId)
        ? state.activeItemIds
        : [...state.activeItemIds, randomItemId],
      allowOverlap: state.allowOverlap,
      loopEnabled: state.loopEnabled,
      visibleItems: state.visibleItems,
    };
  }

  return {
    activeCategoryId: state.activeCategoryId,
    activeItemIds: [randomItemId],
    allowOverlap: state.allowOverlap,
    loopEnabled: state.loopEnabled,
    visibleItems: state.visibleItems,
  };
}

export function stopAllSounds(state: SoundboardState): SoundboardState {
  return {
    activeCategoryId: state.activeCategoryId,
    activeItemIds: [],
    allowOverlap: state.allowOverlap,
    loopEnabled: state.loopEnabled,
    visibleItems: state.visibleItems,
  };
}
