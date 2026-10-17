import type { Quad } from './engine/math'
import type { Sprite } from './skin'

export type ZKey = readonly number[]

export type Tint = {
    r: number
    g: number
    b: number
}

export const BlendMode = {
    normal: 0,
    additive: 1,
} as const

export type BlendModeValue = (typeof BlendMode)[keyof typeof BlendMode]

export type PreviewRenderer = {
    maxViewportSize: {
        width: number
        height: number
    }
    setTexture: (index: 0 | 1, texture: ImageBitmap, interpolation: boolean) => void
    begin: (width: number, height: number, aspectRatio?: number) => void
    draw: (
        sprite: Sprite | undefined,
        quad: Quad,
        z: ZKey,
        a: number,
        tint?: Tint,
        blend?: BlendModeValue,
    ) => void
    flush: () => void
    isContextLost: () => boolean
    dispose: () => void
}

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec3 a_uvw;
attribute float a_texture;
attribute vec4 a_color;
uniform float u_aspect;
varying vec3 v_uvw;
varying float v_texture;
varying vec4 v_color;
void main() {
    gl_Position = vec4(a_position.x / u_aspect, a_position.y, 0.0, 1.0);
    v_uvw = a_uvw;
    v_texture = a_texture;
    v_color = a_color;
}
`

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D u_texture0;
uniform sampler2D u_texture1;
varying vec3 v_uvw;
varying float v_texture;
varying vec4 v_color;
void main() {
    vec2 uv = v_uvw.xy / v_uvw.z;
    vec4 color = mix(texture2D(u_texture0, uv), texture2D(u_texture1, uv), v_texture);
    gl_FragColor = vec4(color.rgb * v_color.rgb * v_color.a, color.a * v_color.a);
}
`

const FLOATS_PER_VERTEX = 10
const FLOATS_PER_QUAD = FLOATS_PER_VERTEX * 6

export const perspectiveWeights = (quad: Quad): [number, number, number, number] => {
    const { bl, tl, tr, br } = quad

    const rx = tr.x - bl.x
    const ry = tr.y - bl.y
    const sx = br.x - tl.x
    const sy = br.y - tl.y

    const denominator = rx * sy - ry * sx
    if (Math.abs(denominator) < 1e-12) return [1, 1, 1, 1]

    const qx = tl.x - bl.x
    const qy = tl.y - bl.y
    const t = (qx * sy - qy * sx) / denominator
    const u = (qx * ry - qy * rx) / denominator

    if (t <= 0 || t >= 1 || u <= 0 || u >= 1) return [1, 1, 1, 1]

    const ox = bl.x + t * rx
    const oy = bl.y + t * ry

    const dBl = Math.hypot(bl.x - ox, bl.y - oy)
    const dTl = Math.hypot(tl.x - ox, tl.y - oy)
    const dTr = Math.hypot(tr.x - ox, tr.y - oy)
    const dBr = Math.hypot(br.x - ox, br.y - oy)

    if (dBl < 1e-12 || dTl < 1e-12 || dTr < 1e-12 || dBr < 1e-12) return [1, 1, 1, 1]

    return [1 + dBl / dTr, 1 + dTl / dBr, 1 + dTr / dBl, 1 + dBr / dTl]
}

type Entry = {
    z: ZKey
    order: number
    blend: BlendModeValue
    data: number[]
}

export const createPreviewRenderer = (
    canvas: HTMLCanvasElement,
    antialias = true,
): PreviewRenderer => {
    const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias,
        premultipliedAlpha: true,
    })
    if (!gl) throw new Error('WebGL is not supported')

    const maxViewportDimensions = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array

    const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)
        if (!shader) throw new Error('Failed to create shader')

        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        return shader
    }

    const program = gl.createProgram()

    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(program)
    gl.useProgram(program)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const uvwLocation = gl.getAttribLocation(program, 'a_uvw')
    const textureLocation = gl.getAttribLocation(program, 'a_texture')
    const colorLocation = gl.getAttribLocation(program, 'a_color')
    const aspectLocation = gl.getUniformLocation(program, 'u_aspect')

    gl.uniform1i(gl.getUniformLocation(program, 'u_texture0'), 0)
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture1'), 1)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    const stride = FLOATS_PER_VERTEX * 4
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, stride, 0)
    gl.enableVertexAttribArray(uvwLocation)
    gl.vertexAttribPointer(uvwLocation, 3, gl.FLOAT, false, stride, 8)
    gl.enableVertexAttribArray(textureLocation)
    gl.vertexAttribPointer(textureLocation, 1, gl.FLOAT, false, stride, 20)
    gl.enableVertexAttribArray(colorLocation)
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, stride, 24)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    const textures = [gl.createTexture(), gl.createTexture()]
    const hasTextures = [false, false]

    for (const [i, texture] of textures.entries()) {
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    let entries: Entry[] = []

    const inputs = new Array<number>(8)
    const outputs = new Array<number>(8)

    return {
        maxViewportSize: {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            width: maxViewportDimensions[0]!,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            height: maxViewportDimensions[1]!,
        },

        setTexture(index, bitmap, interpolation) {
            gl.activeTexture(gl.TEXTURE0 + index)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            gl.bindTexture(gl.TEXTURE_2D, textures[index]!)
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap)

            const filter = interpolation ? gl.LINEAR : gl.NEAREST
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)

            hasTextures[index] = true
        },

        begin(width, height, aspectRatio = width / height) {
            if (canvas.width !== width) canvas.width = width
            if (canvas.height !== height) canvas.height = height

            gl.viewport(0, 0, width, height)
            gl.uniform1f(aspectLocation, aspectRatio)

            entries = []
        },

        draw(sprite, quad, z, a, tint, blend = BlendMode.normal) {
            if (!sprite) return
            if (a <= 0) return
            if (!hasTextures[sprite.texture ?? 0]) return

            let { bl, tl, tr, br } = quad

            if (sprite.transform) {
                const m = sprite.transform

                inputs[0] = bl.x
                inputs[1] = tl.x
                inputs[2] = tr.x
                inputs[3] = br.x
                inputs[4] = bl.y
                inputs[5] = tl.y
                inputs[6] = tr.y
                inputs[7] = br.y

                for (let i = 0; i < 8; i++) {
                    let value = 0
                    for (let j = 0; j < 8; j++) {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        value += m[i * 8 + j]! * inputs[j]!
                    }
                    outputs[i] = value
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                bl = { x: outputs[0]!, y: outputs[4]! }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                tl = { x: outputs[1]!, y: outputs[5]! }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                tr = { x: outputs[2]!, y: outputs[6]! }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                br = { x: outputs[3]!, y: outputs[7]! }
            }

            const [wBl, wTl, wTr, wBr] = perspectiveWeights({ bl, tl, tr, br })

            const { u0, v0, u1, v1 } = sprite
            const tex = sprite.texture ?? 0
            const r = tint?.r ?? 1
            const g = tint?.g ?? 1
            const b = tint?.b ?? 1

            entries.push({
                z,
                order: entries.length,
                blend,
                // prettier-ignore
                data: [
                    bl.x, bl.y, u0 * wBl, v1 * wBl, wBl, tex, r, g, b, a,
                    tl.x, tl.y, u0 * wTl, v0 * wTl, wTl, tex, r, g, b, a,
                    tr.x, tr.y, u1 * wTr, v0 * wTr, wTr, tex, r, g, b, a,
                    bl.x, bl.y, u0 * wBl, v1 * wBl, wBl, tex, r, g, b, a,
                    tr.x, tr.y, u1 * wTr, v0 * wTr, wTr, tex, r, g, b, a,
                    br.x, br.y, u1 * wBr, v1 * wBr, wBr, tex, r, g, b, a,
                ],
            })
        },

        flush() {
            gl.clear(gl.COLOR_BUFFER_BIT)

            if (!entries.length) return

            entries.sort((a, b) => {
                const length = Math.max(a.z.length, b.z.length)
                for (let i = 0; i < length; i++) {
                    const diff = (a.z[i] ?? 0) - (b.z[i] ?? 0)
                    if (diff) return diff
                }
                return a.order - b.order
            })

            const data = new Float32Array(entries.length * FLOATS_PER_QUAD)
            for (const [i, entry] of entries.entries()) {
                data.set(entry.data, i * FLOATS_PER_QUAD)
            }

            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW)

            const setBlend = (blend: BlendModeValue) => {
                if (blend === BlendMode.additive) {
                    gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
                } else {
                    gl.blendFuncSeparate(
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                        gl.ONE,
                        gl.ONE_MINUS_SRC_ALPHA,
                    )
                }
            }

            let runStart = 0
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let runBlend = entries[0]!.blend
            for (let i = 1; i <= entries.length; i++) {
                const entry = entries[i]
                if (entry?.blend === runBlend) continue

                setBlend(runBlend)
                gl.drawArrays(gl.TRIANGLES, runStart * 6, (i - runStart) * 6)

                if (entry) {
                    runStart = i
                    runBlend = entry.blend
                }
            }
        },

        isContextLost: () => gl.isContextLost(),

        dispose: () => {
            gl.getExtension('WEBGL_lose_context')?.loseContext()
        },
    }
}
