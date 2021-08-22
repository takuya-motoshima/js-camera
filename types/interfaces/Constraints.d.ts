export default interface  {
    video: {
        facingMode: 'user' | 'environment';
        width?: number | {
            ideal: number;
        };
        height?: number | {
            ideal: number;
        };
    };
    audio: boolean;
}
