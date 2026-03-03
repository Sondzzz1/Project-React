import { useState, useCallback } from 'react';

/**
 * Hook generic cho API calls với loading/error state
 */
export function useApi(apiFunction) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction(...args);
            setData(result);
            return result;
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
}
