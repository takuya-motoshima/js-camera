export default class {
    private readonly video;
    /**
     * @param  {HTMLVideoElement} video
     * @return {void}
     */
    constructor(video: HTMLVideoElement);
    /**
     * Open stream
     *
     * @param  {Object} constraints
     * @return {void}
     */
    open(constraints: Object): Promise<void>;
    /**
     * Close stream
     *
     * @return {void}
     */
    close(): void;
}
