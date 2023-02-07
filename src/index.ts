import { Lifecycle } from '@well-known-components/interfaces'
import { initComponents } from './components'
import { main } from './service'

// This file is the program entry point, it only calls the Lifecycle function
// eslint-disable-next-line @typescript-eslint/no-floating-promises
Lifecycle.run({ main, initComponents })
