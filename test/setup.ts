import { server } from './mocks/server'
import '@testing-library/jest-dom'

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
