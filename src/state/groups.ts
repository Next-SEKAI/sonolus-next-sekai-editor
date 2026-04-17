import { i18n } from '../i18n'

export type Groups = Map<GroupId, GroupProperties>

declare const idBrand: unique symbol

export type GroupId = number & { [idBrand]: never }

export type GroupProperties = {
    name: string
}

let i = 1

export const addToGroups = (groups: Groups) => {
    const id = i++ as GroupId
    const name = groups.size
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
    })

    return [id, name] as const
}
