"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckIcon, XIcon, ClockIcon, PercentIcon } from "lucide-react"
import QRCode from "@/components/qr-code"

interface ResultScreenProps {
  score: number
  totalRounds: number
  timeTaken: number
  answers: boolean[]
  onRestart: () => void
}

export default function ResultScreen({ score, totalRounds, timeTaken, answers, onRestart }: ResultScreenProps) {
  const accuracy = (score / totalRounds) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}分${secs}秒`
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">游戏结束！</CardTitle>
          <CardDescription className="text-xl mt-2">恭喜您完成挑战！</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center mb-6">
            <p className="text-xl font-bold mb-2">惊喜揭晓：所有简历都是AI生成的！</p>
            <p className="text-gray-600">这个游戏旨在展示AI生成内容的逼真程度，以及我们辨别AI内容的难度。</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
              <ClockIcon className="h-8 w-8 mb-2 text-blue-500" />
              <div className="text-sm text-gray-500">用时</div>
              <div className="text-xl font-bold">{formatTime(timeTaken)}</div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
              <PercentIcon className="h-8 w-8 mb-2 text-green-500" />
              <div className="text-sm text-gray-500">准确率</div>
              <div className="text-xl font-bold">{accuracy.toFixed(0)}%</div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-center">回合记录</h3>
            <div className="space-y-2">
              {answers.map((isCorrect, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>回合 {index + 1}</div>
                  <div className={isCorrect ? "text-green-500 flex items-center" : "text-red-500 flex items-center"}>
                    {isCorrect ? (
                      <>
                        <CheckIcon className="h-5 w-5 mr-1" />
                        <span>正确</span>
                      </>
                    ) : (
                      <>
                        <XIcon className="h-5 w-5 mr-1" />
                        <span>错误</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="mb-4">经过了刚才的游戏，相信您有一些想法能与我们分享，扫码填表告诉我们吧！</p>
            <div className="flex justify-center">
              <QRCode />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onRestart}>
            再玩一次
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
