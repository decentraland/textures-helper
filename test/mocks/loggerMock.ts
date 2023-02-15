import { ILoggerComponent } from '@well-known-components/interfaces'

export function createLogComponentMock(): ILoggerComponent {
  function getLogger(_: string): ILoggerComponent.ILogger {
    return {
      log: () => {},
      error: () => {},
      debug: () => {},
      info: () => {},
      warn: () => {}
    }
  }

  return { getLogger }
}
