import './styles/camera.css';
import { GuiState } from '~/setupGui';
import Constraints from '~/interfaces/Constraints';
import CaptureOptions from '~/interfaces/CaptureOptions';
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
     * @return {Camera}
     */
    static define(): any;
    /**
     * Generate elements
     *
     * @return {Camera}
     */
    static createElement(): any;
    /**
     * Add event listener
     *
     * @param  {string}         type
     * @param  {() => void}     listener
     * @param  {{once: boolen}} options.once
     * @return {Camera}
     */
    on(type: string, listener: (evt?: Event) => void, options?: {
        once: boolean;
    }): Camera;
    /**
     * Remove event listener
     *
     * @param  {string}     type
     * @param  {() => void} listener
     * @return {Camera}
     */
    off(type: string, listener: (evt?: Event) => void): Camera;
    /**
     * Call event listener
     *
     * @param  {string} type
     * @param  {Object} detail
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
     */
    get resolution(): {
        width: number;
        height: number;
    };
    /**
     * Returns the Data URL of the captured image.
     *
     * @param  {CaptureOptions} options
     * @return {string}         Data URL of the captured image.
     */
    capture(options?: CaptureOptions): string;
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
     * Set controller
     *
     * @return {void}
     */
    private setControl;
    /**
     * Set menu
     *
     * @return {void}
     */
    private setMenu;
    /**
     * Set GUI.
     *
     * @return {void}
     */
    private setGui;
    /**
     * Returns the display dimensions and position of the video element
     *
     * @return {{x: number, y: number, width: number, height: number}} rect Display size and position of video element
     *                 x     : The horizontal position of the left-top point where the sourceFrame should be cut,
     *                 y     : The vertical position of the left-top point where the sourceFrame should be cut,
     *                 width : How much horizontal space of the sourceFrame should be cut,
     *                 height: How much vertical space of the sourceFrame should be cut,
     */
    private getRect;
    /**
     * Flip horizontally
     *
     * @param {HTMLCanvasElement} canvas
     * @return {void}
     */
    private flip;
}
export default Camera;
