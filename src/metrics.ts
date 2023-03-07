import { IMetricsComponent } from '@well-known-components/interfaces'
import { getDefaultHttpMetrics, validateMetricsDeclaration } from '@well-known-components/metrics'
import { metricDeclarations as logsMetricsDeclarations } from '@well-known-components/logger'

export const metricDeclarations = {
  ...getDefaultHttpMetrics(),
  ...logsMetricsDeclarations,
  conversion_duration_seconds: {
    help: 'The time (in seconds) it takes for a conversion to be done',
    type: IMetricsComponent.HistogramType,
    labelNames: ['size']
  }
}

// type assertions
validateMetricsDeclaration(metricDeclarations)
