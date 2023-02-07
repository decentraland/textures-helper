import { spawn } from 'child_process'
import ICommandTrigger from '../ports/ICommandTrigger'
import ProcessWrapper from '../types/processWrapper'

export default function createCommandTrigger(): ICommandTrigger {
  const args: string[] = []

  function addArgument(parameter: string): void {
    args.push(parameter)
  }

  function execute(command: string): ProcessWrapper {
    return new ProcessWrapper(spawn(command, args))
  }

  return { addArgument, execute }
}
