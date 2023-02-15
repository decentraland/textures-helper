import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { createServerComponent, createStatusCheckComponent } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent, instrumentHttpServerWithMetrics } from '@well-known-components/metrics'
import { createFetchComponent } from './adapters/fetch'
import { createFileSystemAdapter } from './adapters/fileSystem'
import createAssetConverter from './logic/asset-converter'
import createAssetRetriever from './logic/assetRetriever'
import { metricDeclarations } from './metrics'
import { AppComponents, GlobalContext } from './types'
import createCommandLineAdapter from './adapters/commandLine'
import { createCDNBucket } from './adapters/cdnBucket'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createDotEnvConfigComponent({ path: ['.env.default', '.env'] })
  const metrics = await createMetricsComponent(metricDeclarations, { config })
  const logs = await createLogComponent({ metrics })
  const server = await createServerComponent<GlobalContext>({ config, logs }, {})
  const statusChecks = await createStatusCheckComponent({ server, config })
  const fetch = await createFetchComponent()

  const storages = {
    local: await createFileSystemAdapter({ logs, config }),
    bucket: await createCDNBucket({ config })
  }

  const assetConverter = createAssetConverter(await createCommandLineAdapter({ logs }))
  const assetRetriever = await createAssetRetriever({ config, fetch })

  await instrumentHttpServerWithMetrics({ metrics, server, config })

  return {
    config,
    logs,
    server,
    statusChecks,
    fetch,
    metrics,
    storages,
    assetConverter,
    assetRetriever
  }
}
