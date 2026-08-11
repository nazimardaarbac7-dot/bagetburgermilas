import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker.js'

test('HTTP isteklerini yol ve sorguyu koruyarak HTTPS\'e yönlendirir', async () => {
  const response = await worker.fetch(new Request('http://bagetburgermilas.com.tr/menu?from=test'), {})

  assert.equal(response.status, 308)
  assert.equal(response.headers.get('location'), 'https://bagetburgermilas.com.tr/menu?from=test')
})

test('HTTPS isteklerini statik varlık sunucusuna iletir', async () => {
  const request = new Request('https://bagetburgermilas.com.tr/')
  let forwardedRequest
  const env = {
    ASSETS: {
      fetch(value) {
        forwardedRequest = value
        return new Response('ok', { status: 200 })
      },
    },
  }

  const response = await worker.fetch(request, env)

  assert.equal(forwardedRequest, request)
  assert.equal(await response.text(), 'ok')
})
