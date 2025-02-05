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
    views: number;
    downloads: number;
    favorites: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        current_page: number;
        total_pages: number;
        total_items: number;
        items_per_page: number;
    }
}

export interface WallpaperFilters {
    tags?: string[];
    colors?: string[];
    min_width?: number;
    max_width?: number;
    min_height?: number;
    max_height?: number;
    format?: string;
}

export interface SortOptions {
    field: 'created_at' | 'downloads' | 'views' | 'favorites';
    direction: 'asc' | 'desc';
}