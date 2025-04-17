"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClockIcon } from "lucide-react"

// 模拟简历数据
const generateResumes = (position: string, round: number) => {
  // 在实际应用中，这里可以从API获取预先生成的简历
  const aiResume = {
    name: `候选人 ${round * 2 + 1}`,
    education: "北京大学，计算机科学学士，2018-2022",
    experience: [
      {
        title: `${position}`,
        company: "科技创新有限公司",
        period: "2022年7月 - 至今",
        description: "负责产品开发和迭代，与团队协作完成多个重要项目。通过优化工作流程提高了团队效率20%。",
      },
      {
        title: `初级${position}`,
        company: "未来科技有限公司",
        period: "2021年3月 - 2022年6月",
        description: "参与产品设计和开发，协助团队完成项目目标。获得了'年度新人奖'。",
      },
    ],
    skills: ["团队协作", "项目管理", "沟通能力", "问题解决", "创新思维"],
  }

  const humanResume = {
    name: `候选人 ${round * 2 + 2}`,
    education: "清华大学，软件工程硕士，2016-2020",
    experience: [
      {
        title: `高级${position}`,
        company: "智能科技有限公司",
        period: "2020年8月 - 至今",
        description: "领导团队开发和维护核心产品，提升用户体验和产品质量。通过重构代码库减少了30%的bug。",
      },
      {
        title: `${position}`,
        company: "创新科技有限公司",
        period: "2019年5月 - 2020年7月",
        description: "负责产品功能开发和测试，参与产品规划和设计讨论。成功交付了5个关键项目。",
      },
    ],
    skills: ["领导能力", "技术分析", "战略规划", "用户体验", "敏捷开发"],
  }

  // 随机决定哪个是AI生成的（实际上两个都是）
  const isFirstAI = Math.random() > 0.5

  return {
    resume1: isFirstAI ? aiResume : humanResume,
    resume2: isFirstAI ? humanResume : aiResume,
    aiIndex: isFirstAI ? 0 : 1, // 0表示第一个是AI，1表示第二个是AI
  }
}

interface GameScreenProps {
  position: string
  round: number
  totalRounds: number
  onAnswer: (isCorrect: boolean) => void
}

export default function GameScreen({ position, round, totalRounds, onAnswer }: GameScreenProps) {
  const [timer, setTimer] = useState(0)
  const [resumes, setResumes] = useState<any>(null)
  const [selectedTab, setSelectedTab] = useState<string>("resume1")

  useEffect(() => {
    setResumes(generateResumes(position, round))
    setTimer(0)
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [position, round])

  if (!resumes) return <div>加载中...</div>

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleChoice = (choice: number) => {
    // 判断用户选择是否正确（实际上两个都是AI生成的，所以总是错误）
    onAnswer(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl w-full mx-auto flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-medium">
            回合 {round + 1}/{totalRounds}
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            <span>{formatTime(timer)}</span>
          </div>
        </div>

        <Progress value={(round / totalRounds) * 100} className="mb-6" />

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">哪一份简历是AI生成的？</h2>
          <p className="text-gray-600">仔细比较两份简历，选择您认为是AI生成的那一份</p>
        </div>

        <div className="flex-grow">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="resume1">候选人 {round * 2 + 1}</TabsTrigger>
              <TabsTrigger value="resume2">候选人 {round * 2 + 2}</TabsTrigger>
            </TabsList>

            {["resume1", "resume2"].map((resumeKey, index) => {
              const resume = resumes[resumeKey]
              return (
                <TabsContent key={resumeKey} value={resumeKey} className="flex-grow">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>{resume.name}</CardTitle>
                      <div className="text-sm text-gray-500">{resume.education}</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">工作经验</h3>
                        {resume.experience.map((exp: any, i: number) => (
                          <div key={i} className="mb-3">
                            <div className="font-medium">
                              {exp.title} | {exp.company}
                            </div>
                            <div className="text-sm text-gray-500">{exp.period}</div>
                            <div className="text-sm mt-1">{exp.description}</div>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">技能</h3>
                        <div className="flex flex-wrap gap-2">
                          {resume.skills.map((skill: string, i: number) => (
                            <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={() => handleChoice(index)}>
                        这是AI生成的
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
