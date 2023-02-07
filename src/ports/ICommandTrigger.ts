import ProcessWrapper from '../types/processWrapper'

export default interface ICommandTrigger {
  addArgument(arg: string): void
  execute(command: string): ProcessWrapper
}
