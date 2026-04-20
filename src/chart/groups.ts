import { i18n } from '../i18n'

export type Groups = Map<GroupId, GroupObject>

declare const idBrand: unique symbol

export type GroupId = number & { [idBrand]: never }

export type GroupObject = {
    name: string
    forceNoteSpeed?: number
}

let i = 1

export const addToGroups = (
    groups: Groups,
    name?: string,
    object: Omit<GroupObject, 'name'> = {},
) => {
    const id = i++ as GroupId
    name ??= groups.size
        ? `#${
              Math.max(
                  0,
                  ...[...groups.values()]
                      .map(({ name }) => (name.startsWith('#') ? +name.slice(1) : 0))
                      .filter(Number.isInteger),
              ) + 1
          }`
        : i18n.value.group.default

    groups.set(id, {
        name,
        ...object,
    })

    return [id, name] as const
}
