import fetch, { Headers, Request, Response } from 'node-fetch'
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, TransformStream, WritableStream } from 'stream/web'
import { EventEmitter } from 'events'

// Mock BroadcastChannel for MSW
class BroadcastChannel extends EventEmitter {
  constructor(public name: string) {
    super()
  }
  postMessage(message: any) {
    this.emit('message', { data: message })
  }
  close() {
    this.removeAllListeners()
  }
}

// Polyfill Web APIs before anything else loads
Object.assign(global, {
  fetch,
  Headers,
  Request,
  Response,
  TextEncoder,
  TextDecoder,
  ReadableStream,
  WritableStream,
  TransformStream,
  BroadcastChannel,
})
