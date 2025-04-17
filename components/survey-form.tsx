"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { CheckIcon } from "lucide-react"

export default function SurveyForm() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    occupation: "",
    aiExperience: "",
    gameExperience: "",
    surpriseLevel: "",
    feedback: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)

    // Show success message
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-3">
          <CheckIcon className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold">感谢您的反馈！</h3>
        <p className="text-gray-500">您的意见对我们改进研究和游戏体验非常宝贵。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="age">年龄</Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="请输入您的年龄"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>性别</Label>
          <RadioGroup value={formData.gender} onValueChange={(value) => handleRadioChange("gender", value)} required>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male">男</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female">女</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">其他</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="occupation">职业</Label>
          <Input
            id="occupation"
            name="occupation"
            placeholder="请输入您的职业"
            value={formData.occupation}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>您对AI的了解程度</Label>
          <RadioGroup
            value={formData.aiExperience}
            onValueChange={(value) => handleRadioChange("aiExperience", value)}
            required
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="ai-none" />
              <Label htmlFor="ai-none">完全不了解</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="little" id="ai-little" />
              <Label htmlFor="ai-little">略有了解</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="some" id="ai-some" />
              <Label htmlFor="ai-some">一般了解</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expert" id="ai-expert" />
              <Label htmlFor="ai-expert">非常了解</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>您对游戏体验的评价</Label>
          <RadioGroup
            value={formData.gameExperience}
            onValueChange={(value) => handleRadioChange("gameExperience", value)}
            required
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="exp-1" />
              <Label htmlFor="exp-1">1 - 非常差</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="exp-2" />
              <Label htmlFor="exp-2">2 - 较差</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="exp-3" />
              <Label htmlFor="exp-3">3 - 一般</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="exp-4" />
              <Label htmlFor="exp-4">4 - 良好</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="exp-5" />
              <Label htmlFor="exp-5">5 - 非常好</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>得知所有简历都是AI生成时，您的惊讶程度</Label>
          <RadioGroup
            value={formData.surpriseLevel}
            onValueChange={(value) => handleRadioChange("surpriseLevel", value)}
            required
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="surprise-1" />
              <Label htmlFor="surprise-1">1 - 完全不惊讶</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="surprise-2" />
              <Label htmlFor="surprise-2">2 - 略微惊讶</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3" id="surprise-3" />
              <Label htmlFor="surprise-3">3 - 一般惊讶</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="4" id="surprise-4" />
              <Label htmlFor="surprise-4">4 - 非常惊讶</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="surprise-5" />
              <Label htmlFor="surprise-5">5 - 极度惊讶</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="feedback">其他反馈或建议</Label>
          <Textarea
            id="feedback"
            name="feedback"
            placeholder="请分享您对游戏的其他想法或建议"
            value={formData.feedback}
            onChange={handleChange}
            className="h-32"
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        提交反馈
      </Button>
    </form>
  )
}
