import type { Pointer } from '../pointer'

type Tuple<T, L, R extends T[] = []> = number extends L
    ? T[]
    : R['length'] extends L
      ? R
      : Tuple<T, L, [...R, T]>

export type Recognizer<T = number> = {
    count: T
    recognize: (...pointers: Tuple<[number, Pointer], T>) => boolean
    update?: (pointers: Map<number, Pointer>) => void
    reset?: () => void
}
