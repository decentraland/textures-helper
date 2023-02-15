// This file is the "test-environment" analogous for src/components.ts
// Here we define the test components to be used in the testing environment

import { createLocalFetchCompoment, createRunner } from '@well-known-components/test-helpers'

import { initComponents as originalInitComponents } from '../src/components'
import { main } from '../src/service'
import { TestComponents } from '../src/types'
import { createLogComponentMock } from './mocks/loggerMock'
import { createFileSystemMock } from './mocks/fileSystemMock'
import { createCDNBucketMock } from './mocks/cdnBucketMock'

/**
 * Behaves like Jest "describe" function, used to describe a test for a
 * use case, it creates a whole new program and components to run an
 * isolated test.
 *
 * State is persistent within the steps of the test.
 */
export const test = createRunner<TestComponents>({
  main,
  initComponents
})

async function initComponents(): Promise<TestComponents> {
  const components = await originalInitComponents()

  const { config } = components

  return {
    ...components,
    localFetch: await createLocalFetchCompoment(config),
    logs: createLogComponentMock(),
    storages: {
      local: createFileSystemMock(),
      bucket: createCDNBucketMock()
    }
  }
}
