import { ease } from '../../../ease'
import { lerp, unlerp } from '../../../utils/math'
import { ups } from '../../view'

export const getPathD = (
    tAttachHead: number,
    attachHeadLeft: number,
    attachHeadSize: number,
    tAttachTail: number,
    attachTailLeft: number,
    attachTailSize: number,
    tHead: number,
    tTail: number,
    connectorEase: 'in' | 'out',
) => {
    const pHead = unlerp(tAttachHead, tAttachTail, tHead)
    const pTail = unlerp(tAttachHead, tAttachTail, tTail)
    const pMid = (pHead + pTail) / 2

    const qHead = ease(connectorEase, pHead)
    const qTail = ease(connectorEase, pTail)
    const qMid = connectorEase === 'in' ? pHead * pTail : 1 - (1 - pHead) * (1 - pTail)

    const lHead = lerp(attachHeadLeft, attachTailLeft, qHead)
    const lTail = lerp(attachHeadLeft, attachTailLeft, qTail)
    const lMid = lerp(attachHeadLeft, attachTailLeft, qMid)

    const sHead = lerp(attachHeadSize, attachTailSize, qHead)
    const sTail = lerp(attachHeadSize, attachTailSize, qTail)
    const sMid = lerp(attachHeadSize, attachTailSize, qMid)

    const xHeadL = lHead
    const xHeadR = lHead + sHead
    const yHead = tHead * ups.value

    const xTailL = lTail
    const xTailR = lTail + sTail
    const yTail = tTail * ups.value

    const xMidL = lMid
    const xMidR = lMid + sMid
    const yMid = lerp(tAttachHead, tAttachTail, pMid) * ups.value

    return `M ${xHeadL} ${yHead} Q ${xMidL} ${yMid} ${xTailL} ${yTail} L ${xTailR} ${yTail} Q ${xMidR} ${yMid} ${xHeadR} ${yHead} `
}
