'use client'
import {useEffect, useState} from "react";
import { ChromePicker } from 'react-color'
import { useDraw } from '@/hooks/useDraw'
import { io } from 'socket.io-client'
import {drawLine} from "@/utils/drawLine";
type DrawLineProps = {
    prevPoint: Point | null
    currentPoint: Point
    color: string
}
export default function Home() {
    const socket = io('http://localhost:3001')
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)
    useEffect(()=>{
    const ctx = canvasRef.current?.getContext('2d')
    socket.on('draw-line',({ prevPoint, currentPoint, color }:DrawLineProps) =>{
        if (!ctx) return
        drawLine({
            prevPoint,currentPoint,ctx ,color
        })
    })

        socket.on('clear', clear)
        socket.emit('client-ready')
        socket.on('canvas-state-from-server', (state: string) => {
            console.log('I received the state')
            const img = new Image()
            img.src = state
            img.onload = () => {
                ctx?.drawImage(img, 0, 0)
            }
        })

        socket.on('get-canvas-state', () => {
            if (!canvasRef.current?.toDataURL()) return
            console.log('sending canvas state')
            socket.emit('canvas-state', canvasRef.current.toDataURL())
        })
    },[])
 function createLine({prevPoint,currentPoint,ctx}:Draw){
    socket.emit('draw-line', {
        prevPoint,currentPoint,ctx ,color
    })
     drawLine({
         prevPoint,currentPoint,ctx ,color
     })
 }
  return (
    <main>
      <div className=' h-screen bg-white flex justify-center items-center'>
        <div className='flex flex-col gap-10 pr-10'>
          <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
          <button type='button'
                  onClick={() => socket.emit('clear')}
                  className='p-2 rounded-md border border-black'>
            Clear canvas
          </button>
        </div>
        <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            width={750}
            height={750}
            className='border border-black rounded-md'
        />
      </div>
    </main>
  )
}
