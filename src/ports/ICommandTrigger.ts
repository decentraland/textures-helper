import ProcessWrapper from '../types/processWrapper'

export default interface ICommandTrigger {
  execute(command: string, args: string[]): ProcessWrapper
}
