import {
  createAwsS3BasedFileSystemContentStorage,
  createFolderBasedFileSystemContentStorage,
  createFsComponent
} from '@dcl/catalyst-storage'
import { createDotEnvConfigComponent } from '@well-known-components/env-config-provider'
import { createServerComponent, createStatusCheckComponent } from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { createMetricsComponent, instrumentHttpServerWithMetrics } from '@well-known-components/metrics'
import * as os from 'os'
import { createFetchComponent } from './adapters/fetch'
import { createFileManager } from './adapters/fileSystem'
import { createConversionBuilder } from './logic/asset-converter'
import createAssetRetriever from './logic/assetRetriever'
import { metricDeclarations } from './metrics'
import { AppComponents, GlobalContext } from './types'

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createDotEnvConfigComponent({ path: ['.env.default', '.env'] })
  const metrics = await createMetricsComponent(metricDeclarations, { config })
  const logs = await createLogComponent({ metrics })
  const server = await createServerComponent<GlobalContext>({ config, logs }, {})
  const statusChecks = await createStatusCheckComponent({ server, config })
  const fetch = await createFetchComponent()
  const fs = createFsComponent()

  const bucket = await config.getString('BUCKET')
  const storageDirectory = (await config.getString('STORAGE_DIRECTORY')) || `${os.tmpdir()}`

  const bucketStorage = bucket
    ? await createAwsS3BasedFileSystemContentStorage({ fs, config }, bucket)
    : await createFolderBasedFileSystemContentStorage({ fs }, storageDirectory)

  const storages = {
    local: createFileManager(storageDirectory),
    bucket: bucketStorage
  }

  const conversionBuilder = createConversionBuilder(storageDirectory)
  const assetRetriever = await createAssetRetriever((await config.getString('CONTENT_URL')) || '')

  await instrumentHttpServerWithMetrics({ metrics, server, config })

  return {
    config,
    logs,
    server,
    statusChecks,
    fetch,
    metrics,
    storages,
    conversionBuilder,
    assetRetriever
  }
}
