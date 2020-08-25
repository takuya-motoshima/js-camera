import './styles/camera.css';
import { GuiState } from '~/setupGui';
import Constraints from '~/Constraints';
declare class Camera extends HTMLElement {
    facing: 'front' | 'back' | undefined;
    guiState: GuiState | undefined;
    state: 'open' | 'loading' | 'close';
    constraints: Constraints | undefined;
    private readonly video;
    private stream;
    /**
     * constructor
     */
    constructor();
    /**
     * Called every time the element is inserted into the DOM.
     *
     * @return {void}
     */
    protected connectedCallback(): void;
    /**
     * Define elements
     *
     * @return {this}
     */
    static define(): any;
    /**
     * Generate elements
     *
     * @return {this}
     */
    static createElement(): any;
    /**
     * Add event listener
     *
     * @param  {string}           type
     * @param  {() => void}       listener
     * @param  {{ once: boolen }} options.once
     * @return {this}
     */
    on(type: string, listener: (event?: Event) => void, option?: {
        once: boolean;
    }): Camera;
    /**
     * Remove event listener
     *
     * @param  {string}     type
     * @param  {() => void} listener
     * @return {this}
     */
    off(type: string, listener: (event?: Event) => void): Camera;
    /**
     * Call event listener
     *
     * @param  {string} type
     * @param  {Object}     detail
     * @return {void}
     */
    private invoke;
    /**
     * Open camera
     *
     * @param  {'front'|'back'} facing|back
     * @param  {number} width
     * @param  {number} height
     * @return {Promise<void>}
     */
    open(facing?: 'front' | 'back', width?: number, height?: number): Promise<void>;
    /**
     * Wait for camera to open
     *
     * @return {Promise<void>}
     */
    waitOpen(): Promise<void>;
    /**
     * Close camera
     *
     * @return {void}
     */
    close(): void;
    /**
     * Play camera
     *
     * @return {void}
     */
    play(): void;
    /**
     * Pause camera
     *
     * @return {void}
     */
    pause(): void;
    /**
     * Is the camera open?
     *
     * @return {boolean}
     */
    get opened(): boolean;
    /**
     * Is the camera paused?
     *
     * @return {boolean}
     */
    get paused(): boolean;
    /**
     * Return video size
     *
     * @return {{width:number,height:number}}
     * [getVideoSize description]
     */
    get resolution(): {
        width: number;
        height: number;
    };
    /**
     * Capture a single frame
     *
     * @param  {number} width
     * @param  {number} height
     * @param  {{ width?: number, height?: number, fit?: 'cover'|'contain'|'fill', format?: 'image/webp'|'image/png'|'image/jpeg' }} option
     * @return {string}
     */
    capture(option?: {
        width?: number;
        height?: number;
        fit?: 'cover' | 'contain' | 'fill';
        format?: 'image/webp' | 'image/png' | 'image/jpeg';
    }): string;
    /**
     * Returns the permission status of the requested feature, either granted, denied or - in case the user was not yet asked - prompt.
     *
     * @return {Promise<string|undefined>} granted|denied|prompt|
     *                  - granted: caller will be able to successfuly access the feature without having the user agent asking the user’s permission.
     *                  - denied: caller will not be able to access the feature.
     *                  - prompt: user agent will be asking the user’s permission if the caller tries to access the feature. The user might grant, deny or dismiss the request.
     */
    permission(): Promise<string | undefined>;
    /**
     * Revoke camera access settings
     *
     * typescript doesn't support "navigator.permissions.revoke", so don't use it now
     *
     * @return {Promise<void>}
     */
    revokePermission(): Promise<void>;
    /**
     * Get media tracks
     *
     * @return {MediaStreamTrack[]}
     */
    private get tracks();
    /**
     * Add camera controller
     *
     * @return {void}
     */
    private addCameraControl;
    /**
     * Add camera menu
     *
     * @return {void}
     */
    private addCameraMenu;
    /**
     * Add GUI
     *
     * @return {void}
     */
    private addGui;
}
export default Camera;
