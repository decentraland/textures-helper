import { spawn } from 'child_process'
import ICommandTrigger from '../ports/ICommandTrigger'
import ProcessWrapper from '../types/processWrapper'

export default function createCommandTrigger(): ICommandTrigger {
  function execute(command: string, args: string[]): ProcessWrapper {
    return new ProcessWrapper(spawn(command, args))
  }

  return { execute }
}
