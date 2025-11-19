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
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<Tool>('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const lastPosRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current
    const drawCanvas = drawCanvasRef.current
    if (!bgCanvas || !drawCanvas) return

    const bgCtx = bgCanvas.getContext('2d')
    const drawCtx = drawCanvas.getContext('2d')
    if (!bgCtx || !drawCtx) return
    // Load and draw background image
    const bg = new Image()
    // Resolve the image URL relative to this module
    bg.src = new URL('../../../reference/betterbod.png', import.meta.url).href
    bg.onload = () => {
      bgImageRef.current = bg
      // Draw background scaled to bg canvas
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height)
      bgCtx.drawImage(bg, 0, 0, bgCanvas.width, bgCanvas.height)

      // If there is initial saved image (composited), draw it onto the background for backward compatibility
      if (initialData) {
        const saved = new Image()
        saved.onload = () => {
          bgCtx.drawImage(saved, 0, 0, bgCanvas.width, bgCanvas.height)
          // Initialize history as empty overlay
          const emptyOverlay = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height)
          setHistory([emptyOverlay])
          setHistoryIndex(0)
        }
        saved.src = initialData
      } else {
        // Save initial empty overlay state
        const imageData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height)
        setHistory([imageData])
        setHistoryIndex(0)
      }
    }
  }, [initialData])

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.clearRect(0, 0, width, height)
    const bg = bgImageRef.current
    if (bg) {
      ctx.drawImage(bg, 0, 0, width, height)
    } else {
      // Fallback: plain white background if image not yet loaded
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }
  }

  const saveToHistory = () => {
    const drawCanvas = drawCanvasRef.current
    if (!drawCanvas) return

    const drawCtx = drawCanvas.getContext('2d')
    if (!drawCtx) return

    const imageData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height)
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current
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

    const canvas = drawCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    }
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
      const drawCanvas = drawCanvasRef.current
      if (!drawCanvas) return

      const drawCtx = drawCanvas.getContext('2d')
      if (!drawCtx) return

      const newIndex = historyIndex - 1
      drawCtx.putImageData(history[newIndex], 0, 0)
      setHistoryIndex(newIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const drawCanvas = drawCanvasRef.current
      if (!drawCanvas) return

      const drawCtx = drawCanvas.getContext('2d')
      if (!drawCtx) return

      const newIndex = historyIndex + 1
      drawCtx.putImageData(history[newIndex], 0, 0)
      setHistoryIndex(newIndex)
    }
  }

  const clear = () => {
    const drawCanvas = drawCanvasRef.current
    if (!drawCanvas) return

    const drawCtx = drawCanvas.getContext('2d')
    if (!drawCtx) return

    // Clear only the drawing layer
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height)
    saveToHistory()
  }

  const handleSave = () => {
    const bgCanvas = bgCanvasRef.current
    const drawCanvas = drawCanvasRef.current
    if (!bgCanvas || !drawCanvas) return

    // Composite background and drawing into a single image
    const out = document.createElement('canvas')
    out.width = bgCanvas.width
    out.height = bgCanvas.height
    const outCtx = out.getContext('2d')
    if (!outCtx) return
    outCtx.drawImage(bgCanvas, 0, 0)
    outCtx.drawImage(drawCanvas, 0, 0)
    const dataUrl = out.toDataURL('image/png')
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

          {/* Canvas stack: background and overlay drawing canvas */}
          <div className="flex-1 border rounded-md overflow-hidden relative" style={{ height: 500 }}>
            <canvas
              ref={bgCanvasRef}
              width={800}
              height={500}
              className="w-full block select-none"
            />
            <canvas
              ref={drawCanvasRef}
              width={800}
              height={500}
              className="w-full absolute inset-0 cursor-crosshair"
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
