"use client"

import { useEffect, useRef } from "react"

export default function QRCode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // 这里应该使用实际的QR码生成库
    // 这只是一个简单的模拟QR码的示例
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 清空画布
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制边框
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

    // 绘制模拟QR码图案
    ctx.fillStyle = "black"
    const cellSize = 10
    const offset = 20
    const size = 16

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (Math.random() > 0.6) {
          ctx.fillRect(offset + i * cellSize, offset + j * cellSize, cellSize, cellSize)
        }
      }
    }

    // 绘制定位图案
    ctx.fillRect(offset, offset, cellSize * 3, cellSize * 3)
    ctx.fillRect(offset + (size - 3) * cellSize, offset, cellSize * 3, cellSize * 3)
    ctx.fillRect(offset, offset + (size - 3) * cellSize, cellSize * 3, cellSize * 3)

    ctx.fillStyle = "white"
    ctx.fillRect(offset + cellSize, offset + cellSize, cellSize, cellSize)
    ctx.fillRect(offset + (size - 2) * cellSize, offset + cellSize, cellSize, cellSize)
    ctx.fillRect(offset + cellSize, offset + (size - 2) * cellSize, cellSize, cellSize)
  }, [])

  return <canvas ref={canvasRef} width={200} height={200} className="border border-gray-200 rounded-lg" />
}
