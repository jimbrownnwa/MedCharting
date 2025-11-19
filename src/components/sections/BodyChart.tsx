import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Pencil,
  Eraser,
  MousePointer2,
  Undo2,
  Redo2,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BodyChartProps {
  onSave: (drawingData: string) => void
  initialData?: string
}

type Tool = 'select' | 'pencil' | 'eraser'

const COLORS = ['#000000', '#666666', '#8B4513', '#00BCD4']
const BRUSH_SIZES = [2, 5, 10]

export function BodyChart({ onSave, initialData }: BodyChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const lastPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw body silhouettes
    drawBodySilhouettes(ctx, canvas.width, canvas.height)

    // Save initial state
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory([imageData])
    setHistoryIndex(0)

    if (initialData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = initialData
    }
  }, [initialData])

  const drawBodySilhouettes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const silhouetteWidth = width / 4
    const silhouetteHeight = height * 0.9
    const startY = height * 0.05

    // Draw 4 body silhouettes (simplified representations)
    const positions = [
      { x: silhouetteWidth * 0.5, label: 'Left' },
      { x: silhouetteWidth * 1.5, label: 'Back' },
      { x: silhouetteWidth * 2.5, label: 'Front' },
      { x: silhouetteWidth * 3.5, label: 'Right' }
    ]

    ctx.strokeStyle = '#e0e0e0'
    ctx.lineWidth = 2

    positions.forEach(({ x, label }) => {
      // Simple body outline
      ctx.beginPath()

      // Head
      ctx.arc(x, startY + 30, 20, 0, Math.PI * 2)
      ctx.stroke()

      // Body
      ctx.beginPath()
      ctx.moveTo(x, startY + 50)
      ctx.lineTo(x, startY + silhouetteHeight * 0.5)

      // Arms
      ctx.moveTo(x - 40, startY + 100)
      ctx.lineTo(x, startY + 70)
      ctx.lineTo(x + 40, startY + 100)

      // Torso
      ctx.moveTo(x - 25, startY + 70)
      ctx.lineTo(x - 25, startY + silhouetteHeight * 0.4)
      ctx.lineTo(x + 25, startY + silhouetteHeight * 0.4)
      ctx.lineTo(x + 25, startY + 70)

      // Legs
      ctx.moveTo(x - 15, startY + silhouetteHeight * 0.4)
      ctx.lineTo(x - 20, startY + silhouetteHeight * 0.85)
      ctx.moveTo(x + 15, startY + silhouetteHeight * 0.4)
      ctx.lineTo(x + 20, startY + silhouetteHeight * 0.85)

      ctx.stroke()

      // Label
      ctx.fillStyle = '#999'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(label, x, startY + silhouetteHeight + 10)
    })
  }

  const saveToHistory = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') return
    setIsDrawing(true)
    lastPosRef.current = getPos(e)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'select') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    lastPosRef.current = pos
  }

  const stopDrawing = () => {
    if (isDrawing) {
      saveToHistory()
      setIsDrawing(false)
    }
  }

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const newIndex = historyIndex - 1
      ctx.putImageData(history[newIndex], 0, 0)
      setHistoryIndex(newIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const newIndex = historyIndex + 1
      ctx.putImageData(history[newIndex], 0, 0)
      setHistoryIndex(newIndex)
    }
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawBodySilhouettes(ctx, canvas.width, canvas.height)
    saveToHistory()
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Body Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Toolbar */}
          <div className="flex flex-col gap-2 p-2 bg-muted rounded-md">
            <Button
              variant={tool === 'select' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('select')}
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'pencil' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('pencil')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setTool('eraser')}
            >
              <Eraser className="h-4 w-4" />
            </Button>

            <div className="h-px bg-border my-2" />

            {/* Brush sizes */}
            {BRUSH_SIZES.map((size) => (
              <Button
                key={size}
                variant={brushSize === size ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setBrushSize(size)}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: size * 2, height: size * 2 }}
                />
              </Button>
            ))}

            <div className="h-px bg-border my-2" />

            {/* Colors */}
            {COLORS.map((c) => (
              <Button
                key={c}
                variant="ghost"
                size="icon"
                onClick={() => setColor(c)}
                className={cn(
                  "p-1",
                  color === c && "ring-2 ring-primary"
                )}
              >
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: c }}
                />
              </Button>
            ))}

            <div className="h-px bg-border my-2" />

            <Button variant="ghost" size="icon" onClick={undo}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo}>
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={clear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Canvas */}
          <div className="flex-1 border rounded-md overflow-hidden">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </div>

        <Button className="mt-4 w-full" onClick={handleSave}>
          Save Body Chart
        </Button>
      </CardContent>
    </Card>
  )
}
