export const pickFile = () =>
    new Promise<File | undefined>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'

        input.onchange = () => {
            resolve(input.files?.[0])
        }

        input.oncancel = () => {
            resolve(undefined)
        }

        input.click()
    })

export const getFilename = (file: File) => file.name.split('.')[0]?.trim()

export const pickFileForOpen = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!window.showOpenFilePicker)
        return {
            file: await pickFile(),
        }

    try {
        const [handle] = await window.showOpenFilePicker({
            id,
        })

        return {
            file: await handle.getFile(),
            handle,
        }
    } catch {
        return {}
    }
}

export const pickFileForSave = async (id: string, filename: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!window.showSaveFilePicker) return

    try {
        return await window.showSaveFilePicker({
            id,
            suggestedName: filename,
        })
    } catch {
        return
    }
}
