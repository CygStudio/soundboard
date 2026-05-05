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
export declare function createSoundboardState(input: SoundboardInput): SoundboardState;
export declare function selectSoundboardCategory(input: SoundboardInput, state: SoundboardState, categoryId: string): SoundboardState;
export declare function toggleActiveSound(input: SoundboardInput, state: SoundboardState, itemId: string): SoundboardState;
//# sourceMappingURL=soundboard.d.ts.map