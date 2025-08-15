import { up } from 'up-fetch'

export const api = up(fetch, () => ({
    baseUrl: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    onError: (error, request) => {
        console.error('API Error:', error, request)
    },
    retry: {
        attempts: 3,
        delay: 1000,
    },
}))