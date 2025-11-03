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
