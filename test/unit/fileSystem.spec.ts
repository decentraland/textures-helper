import fs from 'fs'
import { createFileSystemAdapter } from '../../src/adapters/fileSystem'
import IFileSystem from '../../src/ports/IFileSystem'
import { IConfigComponent } from '@well-known-components/interfaces'
import { createConfigComponent } from '@well-known-components/env-config-provider'
import { createLogComponentMock } from '../mocks/loggerMock'

describe('fileSystemAdapter', () => {
  const CONTENT_DIRECTORY = '/test'
  const FILE = 'file.ext'

  let sut: IFileSystem

  beforeAll(async () => {
    const config: IConfigComponent = await createConfigComponent({
      STORAGE_DIRECTORY: CONTENT_DIRECTORY
    })
    const logs = createLogComponentMock()

    sut = await createFileSystemAdapter({ config, logs })
  })

  describe('saveFile should', () => {
    const writeFileMock = jest.spyOn(fs.promises, 'writeFile').mockResolvedValue()

    afterEach(() => {
      writeFileMock.mockReset()
    })

    test('call fs.writeFile passing contentDirectory as prefix for the file path', async () => {
      await sut.saveFile(FILE, new ArrayBuffer(1))

      expect(writeFileMock).toHaveBeenCalledWith(`${CONTENT_DIRECTORY}/${FILE}`, expect.anything())
    })

    test('call fs.writeFile passing the ArrayBuffer allocated into a new buffer', async () => {
      const arrayBuffer = new ArrayBuffer(1)

      await sut.saveFile(FILE, arrayBuffer)

      expect(writeFileMock).toHaveBeenCalledWith(expect.anything(), Buffer.from(arrayBuffer))
    })

    test('return the path where the file was stored', async () => {
      const result = await sut.saveFile(FILE, new ArrayBuffer(1))

      expect(result).toBe(`${CONTENT_DIRECTORY}/${FILE}`)
    })
  })

  describe('retrieveFile should', () => {
    const readFileMock = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(null)

    afterEach(() => {
      readFileMock.mockReset()
    })

    test('call fs.readFile using contentDirectory as prefix for the file path', async () => {
      await sut.retrieveFile(FILE)

      expect(readFileMock).toHaveBeenCalledWith(`${CONTENT_DIRECTORY}/${FILE}`)
    })

    test('return the file buffer', async () => {
      const buffer = Buffer.from(new ArrayBuffer(1))

      readFileMock.mockResolvedValue(buffer)

      const result = await sut.retrieveFile(FILE)

      expect(result).toBe(buffer)
    })
  })

  describe('asReadale should', () => {
    const createReadStreamMock = jest.spyOn(fs, 'createReadStream').mockReturnValue(null)

    afterEach(() => {
      createReadStreamMock.mockReset()
    })

    test('return a read stream of the file specified using contentDirectory as prefix', () => {
      sut.asReadable(FILE)

      expect(createReadStreamMock).toHaveBeenCalledWith(`${CONTENT_DIRECTORY}/${FILE}`)
    })
  })

  describe('deleteFile should', () => {
    const unlinkMock = jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined as never)

    afterEach(() => {
      unlinkMock.mockReset()
    })

    test('call fs.unlink using contentDirectory as prefix for the file path', async () => {
      await sut.deleteFile(FILE, { withSilentFail: true })

      expect(unlinkMock).toHaveBeenCalledWith(`${CONTENT_DIRECTORY}/${FILE}`)
    })

    test('fail silently when withSilentFail = true', async () => {
      unlinkMock.mockRejectedValue(new Error('fail from tests'))

      await expect(sut.deleteFile(FILE, { withSilentFail: true })).resolves
    })

    test('fail loudly (throw an exception) when withSilentFail = false', async () => {
      const expectedError = new Error('fail from tests')
      unlinkMock.mockRejectedValue(expectedError)

      await expect(sut.deleteFile(FILE, { withSilentFail: false })).rejects.toThrow(expectedError)
    })
  })
})
