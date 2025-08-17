import { up } from 'up-fetch'

export const api = up(fetch, () => ({
    baseUrl: `http://localhost:3000/api`,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    onError: (error, request) => {
        console.error('API Error:', error, request)
    },
    retry: {
        attempts: 2,
        delay: 1000,
    },
}))