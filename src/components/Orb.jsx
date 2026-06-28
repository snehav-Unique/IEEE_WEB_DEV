import { Mesh, Program, Renderer, Triangle, Vec3 } from 'ogl'
import { useEffect, useRef } from 'react'
import './Orb.css'

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = '#000000',
  children,
}) {
  const ctnDom = useRef(null)

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    uniform vec3 backgroundColor;
    varying vec2 vUv;

    vec3 rgb2yiq(vec3 c) {
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }

    vec3 yiq2rgb(vec3 c) {
      float r = c.x + 0.956 * c.y + 0.621 * c.z;
      float g = c.x - 0.272 * c.y - 0.647 * c.z;
      float b = c.x - 1.106 * c.y + 1.703 * c.z;
      return vec3(r, g, b);
    }

    vec3 adjustHue(vec3 color, float hueDeg) {
      float hueRad = hueDeg * 3.14159265 / 180.0;
      vec3 yiq = rgb2yiq(color);
      float cosA = cos(hueRad);
      float sinA = sin(hueRad);
      float i = yiq.y * cosA - yiq.z * sinA;
      float q = yiq.y * sinA + yiq.z * cosA;
      yiq.y = i;
      yiq.z = q;
      return yiq2rgb(yiq);
    }

    float snoise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float ringMask(float len, float innerRadius, float outerRadius, float softness) {
      float innerEdge = smoothstep(innerRadius - softness, innerRadius + softness, len);
      float outerEdge = 1.0 - smoothstep(outerRadius - softness, outerRadius + softness, len);
      return innerEdge * outerEdge;
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      float angle = rot;
      float s = sin(angle);
      float c = cos(angle);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

      float len = length(uv);
      float pulse = 0.0015 * sin(iTime * 2.0 + len * 12.0);
      float outline = ringMask(len, 0.842 + pulse, 0.964 + pulse, 0.0018);
      float glow = ringMask(len, 0.83, 0.972, 0.006) * 0.045;

      vec3 lineColorA = adjustHue(vec3(0.972, 0.749, 0.827), hue);
      vec3 lineColorB = adjustHue(vec3(0.910, 0.435, 0.643), hue);
      vec3 lineColor = mix(lineColorA, lineColorB, 0.5 + 0.5 * sin(iTime * 1.6 + len * 9.0));

      float hoverWarp = hover * hoverIntensity;
      float wobble = 0.001 * hoverWarp * sin(uv.y * 18.0 + iTime * 2.2) + 0.001 * hoverWarp * sin(uv.x * 16.0 - iTime * 1.8);
      outline *= ringMask(len + wobble, 0.842, 0.964, 0.0015);
      glow *= 0.65 + 0.03 * snoise(uv * 7.0 + iTime);

      vec3 col = backgroundColor;
      col = mix(col, lineColor, clamp(outline + glow, 0.0, 1.0));

      float alpha = clamp(outline + glow * 0.45, 0.0, 1.0);
      return vec4(col, alpha);
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = vec4(col.rgb * col.a, col.a);
    }
  `

  useEffect(() => {
    const container = ctnDom.current
    if (!container) return undefined

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    container.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
        backgroundColor: { value: hexToVec3(backgroundColor) },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    function resize() {
      if (!container) return
      const dpr = window.devicePixelRatio || 1
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width * dpr, height * dpr)
      gl.canvas.style.width = `${width}px`
      gl.canvas.style.height = `${height}px`
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
    }

    window.addEventListener('resize', resize)
    resize()

    let targetHover = 0
    let lastTime = 0
    let currentRot = 0
    const rotationSpeed = 0.3

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      const width = rect.width
      const height = rect.height
      const size = Math.min(width, height)
      const centerX = width / 2
      const centerY = height / 2
      const uvX = ((x - centerX) / size) * 2.0
      const uvY = ((y - centerY) / size) * 2.0

      targetHover = Math.sqrt(uvX * uvX + uvY * uvY) < 0.8 ? 1 : 0
    }

    const handleMouseLeave = () => {
      targetHover = 0
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    let rafId
    const update = (time) => {
      rafId = requestAnimationFrame(update)
      const dt = (time - lastTime) * 0.001
      lastTime = time

      program.uniforms.iTime.value = time * 0.001
      program.uniforms.hue.value = hue
      program.uniforms.hoverIntensity.value = hoverIntensity
      program.uniforms.backgroundColor.value = hexToVec3(backgroundColor)

      const effectiveHover = forceHoverState ? 1 : targetHover
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.1

      if (rotateOnHover && effectiveHover > 0.5) {
        currentRot += dt * rotationSpeed
      }
      program.uniforms.rot.value = currentRot

      renderer.render({ scene: mesh })
    }

    rafId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [backgroundColor, forceHoverState, hoverIntensity, hue, rotateOnHover])

  return (
    <div ref={ctnDom} className="orb-container">
      <div className="orb-outline-content">{children}</div>
    </div>
  )
}

function hslToRgb(h, s, l) {
  let r
  let g
  let b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return new Vec3(r, g, b)
}

function hexToVec3(color) {
  if (typeof color !== 'string') return new Vec3(0, 0, 0)

  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16) / 255
    const g = parseInt(color.slice(3, 5), 16) / 255
    const b = parseInt(color.slice(5, 7), 16) / 255
    return new Vec3(r, g, b)
  }

  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (rgbMatch) {
    return new Vec3(
      parseInt(rgbMatch[1], 10) / 255,
      parseInt(rgbMatch[2], 10) / 255,
      parseInt(rgbMatch[3], 10) / 255
    )
  }

  const hslMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/)
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360
    const s = parseInt(hslMatch[2], 10) / 100
    const l = parseInt(hslMatch[3], 10) / 100
    return hslToRgb(h, s, l)
  }

  return new Vec3(0, 0, 0)
}
