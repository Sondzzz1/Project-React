import { useState, useCallback } from 'react';

/**
 * Generic hook for API calls with loading/error state management.
 * @template T - The return type of the API function
 */
export function useApi<T>(apiFunction: (...args: unknown[]) => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(
        async (...args: unknown[]): Promise<T> => {
            try {
                setLoading(true);
                setError(null);
                const result = await apiFunction(...args);
                setData(result);
                return result;
            } catch (err: unknown) {
                const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
                const errorMsg = axiosErr.response?.data?.message || axiosErr.message || 'Có lỗi xảy ra';
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [apiFunction]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
}
