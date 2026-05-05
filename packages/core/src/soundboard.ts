export interface SoundboardCategory {
  id: string;
  label: string;
}

export interface SoundboardItem {
  id: string;
  categoryId: string;
  title: string;
  audioUrl: string;
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
  activeItemId: string | null;
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

function resolveInitialActiveItemId(
  input: SoundboardInput,
  activeCategoryId: string | null,
) {
  if (input.initialActiveItemId === undefined) {
    return null;
  }

  const initialItem = getItemById(input, input.initialActiveItemId);

  if (initialItem === null || initialItem.categoryId !== activeCategoryId) {
    return null;
  }

  return initialItem.id;
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
    activeItemId: resolveInitialActiveItemId(input, activeCategoryId),
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
  const activeItemStillVisible = visibleItems.some(
    (item) => item.id === state.activeItemId,
  );

  return {
    activeCategoryId: categoryId,
    activeItemId: activeItemStillVisible ? state.activeItemId : null,
    visibleItems,
  };
}

export function toggleActiveSound(
  input: SoundboardInput,
  state: SoundboardState,
  itemId: string,
): SoundboardState {
  ensureVisibleItemExists(input, state.activeCategoryId, itemId);

  return {
    activeCategoryId: state.activeCategoryId,
    activeItemId: state.activeItemId === itemId ? null : itemId,
    visibleItems: state.visibleItems,
  };
}
