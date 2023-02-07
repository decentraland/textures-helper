import { ChildProcess } from 'child_process'

export default class ProcessWrapper {
  private process: ChildProcess

  constructor(process: ChildProcess) {
    this.process = process
  }

  onError(callback: (data: Buffer) => void) {
    this.process.stderr?.on('data', callback)
  }

  onData(callback: (data: Buffer) => Buffer) {
    this.process.stdout?.on('data', callback)
  }

  writeTo(stream: any) {
    this.process.stdout?.pipe(stream)
  }

  onEnd(callback: (code: number) => void) {
    this.process.on('close', callback)
  }
}
