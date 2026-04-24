/**
 * Download a blob as a file in the browser
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Debounce function - delays execution until after delay ms
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay = 300): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Truncate long text with ellipsis
 */
export function truncate(text: string | undefined | null, maxLength = 50): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Safely extract an array from various API response formats
 * Helps prevent "filter is not a function" or "map is not a function" errors
 */
export function extractArrayData<T>(result: any): T[] {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (typeof result === 'object') {
        if (Array.isArray(result.data)) return result.data;
        if (result.data && Array.isArray(result.data.$values)) return result.data.$values;
        if (result.data && Array.isArray(result.data.items)) return result.data.items;
        if (Array.isArray(result.$values)) return result.$values;
        if (Array.isArray(result.items)) return result.items;
    }
    return [];
}
