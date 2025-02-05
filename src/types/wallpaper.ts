export interface Wallpaper {
    public_id: string;
    name: string;
    width: number;
    height: number;
    format: string;
    created_at: string;
    tags: string[];
    colors: string[];
    preview_url: string;
    download_url: string;
}