import { setupServer } from 'msw/node'
import { handlers } from './posthog-data'

export const server = setupServer(...handlers)
