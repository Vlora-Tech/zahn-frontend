import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // Disable retries globally
            // staleTime: 5 * 60 * 1000, // 5 minutes stale time
            refetchOnWindowFocus: false, // Do not refetch on window focus
            staleTime: 0, // Always consider data as stale
            // cacheTime: 0, // Remove cache immediately
        },
    },
})

export default queryClient
