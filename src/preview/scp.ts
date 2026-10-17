import { inflateRaw, ungzip } from 'pako'

export type ScpArchive = {
    get: (path: string) => Uint8Array | undefined
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    getJson: <T>(path: string) => T | undefined
}

export const parseScp = (buffer: ArrayBuffer): ScpArchive => {
    const bytes = new Uint8Array(buffer)
    const view = new DataView(buffer)

    let eocd = -1
    for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 22 - 65535); i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
            eocd = i
            break
        }
    }
    if (eocd === -1) throw new Error('Invalid scp file')

    const entryCount = view.getUint16(eocd + 10, true)
    const centralDirectoryOffset = view.getUint32(eocd + 16, true)

    const entries = new Map<string, { method: number; offset: number; compressedSize: number }>()

    let offset = centralDirectoryOffset
    const decoder = new TextDecoder()
    for (let i = 0; i < entryCount; i++) {
        if (view.getUint32(offset, true) !== 0x02014b50) throw new Error('Invalid scp file')

        const method = view.getUint16(offset + 10, true)
        const compressedSize = view.getUint32(offset + 20, true)
        const nameLength = view.getUint16(offset + 28, true)
        const extraLength = view.getUint16(offset + 30, true)
        const commentLength = view.getUint16(offset + 32, true)
        const localHeaderOffset = view.getUint32(offset + 42, true)
        const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLength))

        entries.set(name, { method, offset: localHeaderOffset, compressedSize })

        offset += 46 + nameLength + extraLength + commentLength
    }

    const get = (path: string) => {
        const entry = entries.get(path.startsWith('/') ? path.slice(1) : path)
        if (!entry) return

        if (view.getUint32(entry.offset, true) !== 0x04034b50) throw new Error('Invalid scp file')

        const nameLength = view.getUint16(entry.offset + 26, true)
        const extraLength = view.getUint16(entry.offset + 28, true)
        const start = entry.offset + 30 + nameLength + extraLength
        const data = bytes.subarray(start, start + entry.compressedSize)

        switch (entry.method) {
            case 0:
                return data
            case 8:
                return inflateRaw(data)
            default:
                throw new Error(`Unsupported compression method: ${entry.method}`)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    const getJson = <T>(path: string) => {
        const data = get(path)
        if (!data) return

        return JSON.parse(new TextDecoder().decode(data)) as T
    }

    return { get, getJson }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const parseGzippedJson = <T>(data: Uint8Array) =>
    JSON.parse(new TextDecoder().decode(ungzip(data))) as T
