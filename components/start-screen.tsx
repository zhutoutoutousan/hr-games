"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface StartScreenProps {
  onStart: (position: string) => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [selectedPosition, setSelectedPosition] = useState("")

  const positions = ["软件工程师", "产品经理", "市场营销专员", "人力资源专员", "财务分析师"]

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">AI简历辨别挑战</CardTitle>
          <CardDescription className="text-xl mt-2">您能分辨出哪些简历是AI生成的吗？</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-lg">
              在这个游戏中，您将看到多对简历，需要判断哪一份是AI生成的。 测试您的辨别能力，看看您能否识破AI的伪装！
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">选择职位类型</Label>
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger id="position">
                <SelectValue placeholder="选择一个职位" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-lg py-6"
            size="lg"
            disabled={!selectedPosition}
            onClick={() => onStart(selectedPosition)}
          >
            开始游戏
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
