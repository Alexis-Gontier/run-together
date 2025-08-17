import { up } from 'up-fetch'

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const api = up(fetch, () => ({
    baseUrl: `${API_URL}/api`,
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