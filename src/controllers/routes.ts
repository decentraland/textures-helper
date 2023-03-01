import { Router } from '@well-known-components/http-server'
import { GlobalContext } from '../types'
import { resizeHandler } from './handlers/resize-handler'
import { wellKnownComponents } from 'decentraland-crypto-middleware'

// We return the entire router because it will be easier to test than a whole server
export async function setupRouter(_globalContext: GlobalContext): Promise<Router<GlobalContext>> {
  const router = new Router<GlobalContext>()

  router.use('/content/dxt/:length', wellKnownComponents({}))
  router.get('/content/dxt/:length', resizeHandler)

  return router
}
