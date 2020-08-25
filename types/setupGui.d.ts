/**
 * GUI state interface
 */
export interface GuiState {
    resolution: string;
    facing: 'back' | 'front';
    format: 'image/webp' | 'image/png' | 'image/jpeg';
    resize: boolean;
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill';
}
/**
 * Setup GUI state
 *
 * @param {HTMLElement} container
 */
export declare function setupGui(container: HTMLElement, callback: (prop: string, value: string | number | boolean) => void): GuiState;
