import type { Entity } from '../entities'
import type { Transaction } from '../transaction'

export type AddMutation<T> = (transaction: Transaction, object: T) => Entity[]

export type RemoveMutation<T> = (transaction: Transaction, entity: T) => void
