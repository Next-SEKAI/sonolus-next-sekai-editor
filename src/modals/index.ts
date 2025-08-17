import { shallowReactive, type Component, type ComponentInstance } from 'vue'

let id = 0

export type Modal = {
    id: number
    is: Component
    props: object
    resolve: (result?: never) => void
}

export const modals = shallowReactive<Modal[]>([])

type ModalProps<T extends Component> = ComponentInstance<T>['$props']

type ModalResult<T extends Component> = ComponentInstance<T>['$emit'] extends (
    event: 'close',
    result: infer R,
) => void
    ? R
    : never

export const showModal = <T extends Component>(component: T, props: ModalProps<T>) =>
    new Promise<ModalResult<T> | undefined>((resolve) => {
        modals.push({
            id: id++,
            is: component,
            props,
            resolve,
        })
    })
