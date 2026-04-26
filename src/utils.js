export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))
export const lcm = (a, b) => Math.abs(a * b) / (gcd(a, b) || 1)
export const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const estimateImageCount = (num, den) => Math.ceil(Math.abs(num) / den) || 1

export function getBestGrid(n) {
  const sqrt = Math.sqrt(n)
  if (Number.isInteger(sqrt)) return { cols: sqrt, rows: sqrt }

  const maxCols = 12
  let bestExact = null
  for (let c = 2; c <= maxCols; c++) {
    if (n % c === 0) {
      const r = n / c
      const diff = Math.abs(c - r)
      if (!bestExact || diff < bestExact.diff) {
        bestExact = { cols: c, rows: r, diff }
      }
    }
  }

  if (bestExact && bestExact.rows > 12 && bestExact.cols <= 4) bestExact = null
  if (bestExact) return { cols: bestExact.cols, rows: bestExact.rows }

  let c = Math.ceil(Math.sqrt(n))
  if (c > 12) c = 12
  const r = Math.ceil(n / c)
  return { cols: c, rows: r }
}

export const POINT_COLORS = [
  '#6c5ce7', '#e17055', '#00b894', '#0984e3',
  '#e84393', '#d63031', '#00cec9', '#fdcb6e',
]

export const SHAPES = ['circle', 'rect', 'poly', 'star']
export const QUIZ_COLORS = ['#FF6B6B', '#4ECDC4', '#6c5ce7', '#00b894', '#e17055', '#0984e3']
