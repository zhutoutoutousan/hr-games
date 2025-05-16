'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameNav } from '@/components/GameNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getSurveyData, submitSurveyAnswer } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const DEFAULT_SURVEY_DATA = [
  { name: '强烈反对', value: 0 },
  { name: '反对', value: 0 },
  { name: '中立', value: 0 },
  { name: '支持', value: 0 },
  { name: '强烈支持', value: 0 },
];

const JOB_POSITIONS = [
  {
    id: '1',
    title: '行政专员',
    description: `# 行政专员岗位职责

## 办公室管理与行政事务
- 负责办公室日常运营，包括用品采购、设备维护、环境管理，确保行政支持高效运作
- 协调办公室维护维修，对接物业和供应商

## 会议与活动支持
- 安排协调会议，准备材料，记录纪要并跟进
- 协助策划执行公司活动

## 出行与后勤
- 为员工安排差旅住宿，管理邮件、包裹和快递收发

## 沟通与接待
- 接听转接电话，记录留言，接待访客，维护接待区域专业温馨形象

## 行政支持
- 维护整理纸质和电子文件，协助处理基本人力资源任务（入职离职文件，员工记录）
- 为团队提供一般行政支持

## 其他职责
- 完成上级交办的其他行政相关工作

# 任职要求

## 教育背景与工作经验
- 本科及以上学历，工商管理、公共管理或相关专业优先
- 至少2-3年行政支持相关工作经验

## 技术技能
- 熟练使用Microsoft Office Suite，尤其精通Excel
- 熟悉办公室管理软件和基本办公设备

## 软技能
- 优秀的普通话口头和书面沟通能力
- 较强的组织和时间管理能力，能有效安排工作优先级
- 注重细节，工作准确性高
- 良好的人际交往和团队合作能力，具备客户服务意识
- 积极主动，有责任心，能在最少监督下独立工作`
  },
  {
    id: '2',
    title: '软件工程师',
    description: `# 软件工程师岗位职责

## 开发与实现
- 负责公司核心产品的设计、开发和维护
- 编写高质量、可维护的代码，确保代码符合最佳实践
- 参与代码审查，提供建设性反馈
- 实现新功能并优化现有功能

## 技术架构
- 参与系统架构设计和技术选型
- 确保系统的可扩展性、安全性和性能
- 制定技术方案和开发规范

## 质量保证
- 编写单元测试和集成测试
- 进行代码重构和性能优化
- 解决生产环境中的技术问题

## 团队协作
- 与产品、设计、测试等团队紧密合作
- 参与技术方案讨论和评审
- 指导初级开发人员

# 任职要求

## 教育背景与工作经验
- 本科及以上学历，计算机科学或相关专业
- 3年以上软件开发经验

## 技术技能
- 精通至少一种主流编程语言（Java/Python/Go等）
- 熟悉常用框架和工具（Spring Boot/Django/Gin等）
- 了解数据库设计和优化（MySQL/PostgreSQL等）
- 掌握版本控制工具（Git）和CI/CD流程

## 软技能
- 良好的问题分析和解决能力
- 优秀的团队协作和沟通能力
- 持续学习的意愿和能力
- 对技术有热情，关注技术发展趋势`
  },
  {
    id: '3',
    title: '产品经理',
    description: `# 产品经理岗位职责

## 产品规划
- 负责产品的整体规划和战略制定
- 进行市场调研和竞品分析
- 制定产品路线图和迭代计划
- 定义产品功能和优先级

## 需求管理
- 收集和分析用户需求
- 编写产品需求文档（PRD）
- 与开发团队沟通需求细节
- 管理产品需求变更

## 项目管理
- 协调跨部门资源，推动产品开发
- 跟踪项目进度，确保按时交付
- 管理产品生命周期
- 制定产品发布计划

## 数据分析
- 制定产品指标体系
- 分析用户行为数据
- 跟踪产品关键指标
- 基于数据优化产品

# 任职要求

## 教育背景与工作经验
- 本科及以上学历，计算机、设计或相关专业
- 3年以上互联网产品经理经验

## 专业技能
- 熟悉产品开发流程和项目管理方法
- 熟练使用产品设计工具（Axure/Sketch等）
- 具备数据分析能力
- 了解基本的技术原理

## 软技能
- 优秀的沟通和协调能力
- 强大的逻辑思维和分析能力
- 良好的项目管理能力
- 对用户体验有深刻理解`
  },
  {
    id: '4',
    title: '高级行政专员',
    description: `# 高级行政专员岗位职责

## 行政运营管理
- 全面负责公司行政部门的日常运营和管理工作
- 制定和完善行政管理制度和工作流程
- 统筹管理办公环境、固定资产和办公用品
- 优化行政服务流程，提升工作效率

## 团队管理与培训
- 指导和管理行政团队，确保服务质量
- 负责新入职行政人员的培训和指导
- 制定团队绩效考核标准
- 组织团队建设活动，提升团队凝聚力

## 跨部门协作
- 与人力资源部门紧密合作，协助招聘和员工关系管理
- 协调各部门行政需求，提供专业支持
- 参与公司重要会议和活动策划
- 对接外部供应商和物业管理部门

## 预算管理
- 负责行政部门年度预算的制定和执行
- 控制行政成本，优化资源配置
- 审核行政相关费用支出
- 定期进行预算执行情况分析

# 任职要求

## 教育背景与工作经验
- 本科及以上学历，行政管理、工商管理或相关专业
- 5年以上行政管理工作经验，其中2年以上团队管理经验
- 有大型企业或跨国公司工作经验优先

## 专业技能
- 精通行政管理工作流程和制度制定
- 熟练使用各类办公软件和办公设备
- 具备基本的财务知识和预算管理能力
- 熟悉劳动法规和行政管理相关法规

## 管理能力
- 出色的团队管理和领导能力
- 优秀的沟通协调和问题解决能力
- 具备项目管理和活动策划能力
- 良好的决策能力和执行力

## 软技能
- 高度的责任心和职业素养
- 优秀的服务意识和团队协作精神
- 良好的抗压能力和应变能力
- 积极主动，善于创新和改进工作方法`
  }
];

// Hardcoded resumes
const RESUMES = [
  {
    id: '1',
    content: `# 蒲女士
## 基本信息
- 四川
- 工作4年
- 26 岁
- 四川大学 · 法学 · 本科 · 非统招

## 个人亮点
- 为人正直，责任心强，亲和力强，工作细致严谨
- 拥有四年行政管理工作经验，具有良好的组织和协调能力，能够高效处理日常工作
- 熟练掌握办公软件，擅长 excel
- 系统学习过财务课程，有一定财务知识
- 持有C1驾驶证，熟练驾驶

## 工作经历
### 四川港航融欧供应链管理有限公司
**行政专员** | 2024.08-2024.12 (4个月)
- 部门氛围建设：生日会举办、团建组织、工会活动及福利发放等
- 党建事宜：三会一课召开、会议纪要撰写、收发文等、党费收缴等
- 行政及后勤：会议组织、会务服务、费用报销、供应商对接及按时付款、办公物品采买、固定资产盘点、合同管理、工商变更、印章管理等
- 相应台账建立并按时登记

### 国药控股(中国)融资租赁有限公司
**行政专员** | 2023.11-2024.05 (6个月)
- 负责办理公司公文（起草/审核公司总结、纪要、请示、报告、信息等
- 访客指引、电话接听、日常报修、文件快递收发
- 职场规划改造
- 行政工作：会议室管理、会务支持、固定资产管理、物资采购、行政费用预算及分析、日常费用核算报销、办公环境维护、保洁人员管理、供应商管理
- 会议策划与组织协调及实施（会议布置、车辆安排、酒店预订、餐饮接待）
- 其他工作：协助完成工会、行政等组织的团队活动及领导交办的其他事务
- 每月工作汇报，主要汇报当月工作内容及下月工作计划

### 成都华臣石油化工有限公司
**行政管理** | 2020.12-2023.10 (2年10个月)
- 工商及银行：资质申报、银行开户、配合税务部门检查及前期准备
- 人事：协助进行人员招聘，包括筛选简历、安排面试等；员工入离转调手续的办理，考勤统计等；社保公积金开户及缴费
- 负责日常行政工作: 处理公司领导或部门主任交办的临时事项；对外日常行政事务，外单位来访来电
- 办公室管理:保洁绿植安排、物资采购；后勤保障:固定资产盘点、公车管理；领导接待：餐厅、酒店预定及车辆安排；团建组织、策划、安排

## 教育经历
### 四川大学
**法学** | 非统招本科 | 2023.09-2026.06 (3年)

### 四川商务职业学院
**商务英语** | 统招大专 | 2017.09-2020.06 (3年)

## 技能标签
- 亲和力强
- 持续学习
- 正能量
- 行政管理
- 行政后勤
- 经验丰富
- 做事认真

## 语言能力
- 英语(简单沟通)
- 普通话`,
    aiScore: 79,
    isAIGenerated: true
  },
  {
    id: '2',
    content: `# 李女士
## 基本信息
- 上海
- 工作5年
- 28 岁
- 华东师范大学 · 行政管理 · 本科

## 个人亮点
- 5年大型企业行政管理工作经验
- 擅长团队建设和活动策划
- 具备优秀的沟通协调能力
- 熟悉企业行政管理流程
- 持有高级秘书资格证书

## 工作经历
### 上海某科技公司
**行政主管** | 2022.01-至今
- 负责公司行政部门的日常管理工作
- 制定和完善行政管理制度
- 组织公司各类大型活动
- 管理公司固定资产和办公用品
- 协调各部门之间的行政事务

### 某外资企业
**行政专员** | 2019.07-2021.12
- 负责公司日常行政事务
- 组织部门会议和活动
- 管理办公用品和固定资产
- 处理员工福利相关事务
- 协助人力资源部门工作

## 教育经历
### 华东师范大学
**行政管理** | 本科 | 2015.09-2019.06

## 技能标签
- 行政管理
- 团队建设
- 活动策划
- 沟通协调
- 办公软件

## 语言能力
- 英语(流利)
- 普通话`,
    aiScore: 85,
    isAIGenerated: false
  },
  {
    id: '3',
    content: `# 张先生
## 基本信息
- 北京
- 工作3年
- 25 岁
- 北京师范大学 · 工商管理 · 本科

## 个人亮点
- 3年行政管理工作经验
- 熟悉企业行政管理流程
- 具备良好的沟通能力
- 工作认真负责
- 学习能力强

## 工作经历
### 北京某教育科技公司
**行政专员** | 2021.03-至今
- 负责公司日常行政事务
- 组织部门会议和活动
- 管理办公用品和固定资产
- 处理员工福利相关事务
- 协助人力资源部门工作

### 某互联网公司
**行政助理** | 2020.07-2021.02
- 协助处理日常行政事务
- 负责文件整理和归档
- 协助组织公司活动
- 管理办公用品
- 接待来访客户

## 教育经历
### 北京师范大学
**工商管理** | 本科 | 2016.09-2020.06

## 技能标签
- 行政管理
- 沟通协调
- 办公软件
- 团队协作
- 活动组织

## 语言能力
- 英语(良好)
- 普通话`,
    aiScore: 92,
    isAIGenerated: true
  },
  {
    id: '4',
    content: `# 周丹
## 基本信息
- 33 岁
- 离职，正在找工作
- 四川师范大学 · 学前教育 · 本科 · 非统招

## 综合能力/个人亮点
- 适应能力 | 沟通协调能力 | 执行力 | 责任心 | 亲和力
- 多年行政岗位工作经验，熟练掌握办公技能
- 性格随和、乐于助人，工作踏实认真、有责任心
- 具有较强的组织协调能力、紧急事件处理能力
- 具备良好的自学和自我管控能力，能够快速适应新环境

## 求职意向
- 行政专员/助理
- 成都
- 6-10k×12薪
- 全部行业

## 工作经历
### 北京梅赛德斯-奔驰销售服务有限公司成都分公司
**行政前台** | 2024.01-2024.09 (8个月)
- 负责前台电话的接听和转接工作；日常公司访客的接待、咨询和引见
- 负责信件快递、报刊、文件的收发工作
- 维护前台环境，确保前台环境良好，对接供应商采购鲜花绿植等物品
- 公司日常维护及供应商对接工作，包括绿植养护、日常保洁、公司设备使用、修缮以及门禁管理
- 确保前台区域宣传片正常播放，定期巡视办公室工区，确保通道安全与工位摆设规范
- 会议支持，包括会议前期准备、设备调试、会议订餐及会议室环境卫生等
- 负责办公用品及固定资产管理工作，协助各部门同事领取并登记、盘点
- 公司办公座位和钥匙管理，及时更新座位表等
- 办公室车辆管理（日常保养、充电等）
- 协助突发事件处理：应对突发事件，如办公设备故障、以及紧急工作安排等
- 协助做好企业文化建设，包括协助公司活动开展（如家庭日、圣诞节等）
- 根据员工出差工作需求，协助业务部门预订机票、酒店，并做好报销工作

### 成都速展科技有限公司
**行政人事** | 2021.05-2024.01 (2年8个月)
- 日常行政事务管理：负责日常行政事务的安排与执行，包括办公用品的采购、资产管理、日常接待、考勤工作等
- 文件资料管理：负责各类文件、资料的管理与存档，确保文件资料的安全与保密
- 制度建设与执行：协助制定行政管理制度与流程，确保公司各项行政事务的规范执行
- 员工关怀与福利保障：负责员工福利保障，节假日员工福利的采购与发放，组织员工活动
- 负责监督公司服务工作，巡查办公区域环境卫生，包括绿植养护、工位整洁等
- 深入了解公司所处行业，结合业务发展计划，与用人部门高效协作，梳理招聘需求
- 主要招聘软件开发人员及市场推广人员等

### 成都有明堂互动科技有限公司
**行政人事** | 2019.03-2021.04 (2年1个月)
- 日常行政事务管理：负责日常行政事务的安排与执行
- 文件资料管理：负责各类文件、资料的管理与存档
- 制度建设与执行：协助制定行政管理制度与流程
- 员工关怀与福利保障：负责员工福利保障，节假日员工福利的采购与发放
- 负责组织开展各种形式的企业文化活动，丰富员工业余生活
- 各类行政事项或突发事件的应急处理
- 协助处理公司搬迁事宜，包括前期场地选择及入驻准备等
- 政府项目申报工作，申报国家及省市政府发布的相关企业补贴
- 人事日常工作，包含招聘管理、员工入离职管理、员工关系、培训与发展等

### 成都卓越动力科技有限公司
**行政人事** | 2017.12-2019.02 (1年2个月)
- 负责公司的日常行政运营办公支持，持续改善办公秩序及办公环境
- 负责公司行政固定资产、低值易耗品等管理工作，日常盘点及维护
- 负责日常供应商管理对接维护，包含（绿植、快递、物业等）
- 企业公众号内容编辑及运营
- 员工关怀与福利保障：负责员工福利保障，节假日员工福利的采购与发放
- 负责组织开展各种形式的企业文化活动，丰富员工业余生活
- 人事日常工作，包含招聘管理、员工入离职管理、员工关系、培训与发展等

### 成都盖亚互动信息技术有限公司
**人事专员** | 2016.11-2017.11 (1年)
- 负责公司人事招聘相关工作，招聘岗位如：客户端开发、服务器开发、产品、运营、运维等
- 办理员工入职、离职、转正、调岗等人事关系工作
- 负责社会保险、公积金的开户、增减、补缴及其他相关事宜
- 负责公司证照管理、资质年检办理及工商年检资料填报事宜等
- 协助领导处理劳动纠纷、及员工出现的各种人事问题
- 协助行政开展公司团建拓展、年会、生日会等活动

### 成都杰迈科技有限责任公司
**行政人事助理** | 2015.05-2016.10 (1年5个月)
- 协助公司人事招聘；招聘岗位如：客户端开发、服务器开发、测试、原画、动作、角色模型、策划、运营等
- 办理员工入职、离职、转正、调岗等人事关系工作
- 负责社会保险、公积金的开户、增减、补缴及其他相关事宜
- 协助领导制定公司相关行政管理制度，监督各种制度实行情况
- 负责办公用品、固定资产的采购、管理、盘点
- 协助部门领导拟定各类公文函件，做好信息上传下达工作
- 协助部门领导开展公司各类活动、会议、培训等

## 教育经历
### 四川师范大学
**学前教育** | 非统招本科 | 2012.04-2016.07 (4年)

## 技能标签
- 劳动争议处理经验
- 团队建设

## 语言能力
- 普通话

## 附加信息
- 计算机一级证书
- 普通话二级甲等证书`,
    aiScore: 88,
    isAIGenerated: false
  },
  {
    id: '5',
    content: `# 王芳
## 基本信息
- 28 岁
- 离职，正在找工作
- 北京师范大学 · 行政管理 · 本科 · 统招

## 综合能力/个人亮点
- 适应能力 | 沟通协调能力 | 执行力 | 责任心 | 亲和力 | 组织能力 | 时间管理能力 | 注重细节 | 团队合作 | 客户服务意识
- 具备扎实的行政管理基础和三年行政支持相关工作经验
- 熟悉办公室日常运营和行政事务管理
- 能够高效完成办公用品采购、设备维护、环境管理等工作
- 具备良好的沟通协调能力，能有效对接物业和供应商
- 能够熟练安排协调会议，准备会议材料，并记录和跟进会议纪要
- 积极协助策划执行公司各类活动
- 具备良好的出行与后勤管理能力
- 拥有优秀的普通话口头和书面沟通能力
- 注重细节，工作准确性高
- 积极主动，有责任心，能在最少监督下独立工作
- 熟练使用Microsoft Office Suite，尤其精通Excel

## 工作经历
### 北京创想科技有限公司
**行政专员** | 2022.05 - 2024.10
- 负责办公室日常运营，包括办公用品的采购和管理、打印机、复印机等办公设备的维护和保养、办公室绿植的养护和办公室环境的清洁与整理
- 协调办公室的维修和维护事宜，与大厦物业管理部门和各类供应商进行有效沟通和对接
- 安排和协调各类会议，包括会议室的预订、会议议程的通知、会议所需材料的准备以及会议纪要的记录和跟进
- 协助公司各类员工活动的策划和执行，包括部门团建、节日庆祝、年会筹备等
- 负责员工国内差旅和酒店的预订安排
- 管理公司邮件、包裹和快递的收发、登记和分发
- 负责前台电话的接听和转接，耐心解答来电咨询，准确记录重要留言
- 热情接待来访客人，提供指引和茶水等必要的服务
- 负责公司纸质合同、行政文件和电子文档的整理和归档
- 协助人力资源部门处理新员工的入职手续
- 完成上级领导交办的其他行政相关工作

### 北京汇通商务有限公司
**行政助理** | 2020.07 - 2022.03
- 负责办公室日常办公用品的采购、领用登记和库存管理
- 协助进行公司固定资产的盘点和管理
- 负责公司文件、资料的复印、打印和装订工作
- 协助组织公司内部会议和培训活动的场地布置和物资准备
- 负责员工报销单据的初步审核和整理
- 协助处理部分人事行政事务，例如员工考勤统计

## 教育经历
### 北京师范大学
**行政管理** | 本科 统招 | 2016.09 - 2020.06

## 技能标签
- 行政管理
- 办公室管理
- 会议管理
- 活动策划与执行
- 文件管理
- 客户服务
- 供应商管理
- 沟通协调
- 组织能力
- 时间管理
- Microsoft Office Suite (Word, Excel, PowerPoint, Outlook)
- Excel精通
- 办公设备维护

## 语言能力
- 普通话（流利）
- 英语（CET-4）

## 附加信息
- 计算机二级证书
- 普通话二级甲等证书`,
    aiScore: 92,
    isAIGenerated: true
  }
];

interface SurveyResult {
  aiLeadership: string;
  aiImpactAreas: string;
}

interface LeadershipResult {
  aiLeadership: string;
}

interface ImpactResult {
  aiImpactAreas: string;
}

// Add this at the top of the file after the imports
const markdownStyles = {
  h1: 'text-2xl font-bold text-blue-600 mb-4',
  h2: 'text-xl font-bold text-purple-600 mb-3',
  h3: 'text-lg font-bold text-indigo-600 mb-2',
  p: 'text-gray-600 leading-relaxed mb-3',
  strong: 'text-gray-800 font-semibold',
  ul: 'text-gray-600 space-y-1 mb-4 list-disc pl-5',
  li: 'text-gray-600 mb-1',
  a: 'text-blue-600 hover:underline',
  blockquote: 'text-gray-500 border-l-4 border-blue-500 pl-4 italic',
  code: 'text-pink-600 bg-gray-50 px-1 py-0.5 rounded',
  pre: 'bg-gray-50 text-gray-800 rounded-lg p-4 mb-4',
  hr: 'border-gray-200 my-4',
  table: 'border-collapse w-full mb-4',
  th: 'border border-gray-300 bg-gray-50 p-2 text-left',
  td: 'border border-gray-300 p-2',
  img: 'rounded-lg mb-4'
};

export default function TrueFalseCVGame() {
  const router = useRouter();
  const [currentPosition, setCurrentPosition] = useState(JOB_POSITIONS[0]);
  const [resumes, setResumes] = useState(RESUMES);
  const [currentResumeIndex, setCurrentResumeIndex] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result' | 'survey'>('idle');
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [leadershipData, setLeadershipData] = useState<any[]>([]);
  const [impactData, setImpactData] = useState<any[]>([]);
  const [userOpinion, setUserOpinion] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ isAI: boolean; agreeScore: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAnswer, setIsAIAnswer] = useState<boolean | null>(null);
  const [agreeScoreAnswer, setAgreeScoreAnswer] = useState<boolean | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<{
    aiUsageOpinion: string;
    aiLeadership: string;
    aiImpactAreas: string[];
    otherImpactArea: string;
  }>({
    aiUsageOpinion: '',
    aiLeadership: '',
    aiImpactAreas: [],
    otherImpactArea: '',
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showGuessResult, setShowGuessResult] = useState(false);
  const [guessCorrect, setGuessCorrect] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<string>('');
  const [selectedGuessType, setSelectedGuessType] = useState<'opinion' | 'leadership' | 'impact'>('opinion');
  const [showResults, setShowResults] = useState(false);
  const [guesses, setGuesses] = useState({
    opinion: '',
    leadership: '',
    impact: ''
  });
  const [guessResults, setGuessResults] = useState({
    opinion: false,
    leadership: false,
    impact: false
  });
  const [showAllGuessResults, setShowAllGuessResults] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    fetchSurveyData();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'result' && showResults) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('idle');
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, showResults]);

  const fetchSurveyData = async () => {
    try {
      const data = await getSurveyData();
      setSurveyData(data.length > 0 ? data : DEFAULT_SURVEY_DATA);
      
      // Fetch leadership data
      const { data: leadershipResults } = await supabase
        .from('SurveyAnswer')
        .select('aiLeadership');
      
      const leadershipCounts = {
        '由 IT 部门主导': 0,
        '由 HR部门主导': 0,
        '由公司高层管理（C-Suite）主导': 0
      };
      
      leadershipResults?.forEach((result: LeadershipResult) => {
        if (result.aiLeadership in leadershipCounts) {
          leadershipCounts[result.aiLeadership as keyof typeof leadershipCounts]++;
        }
      });
      
      setLeadershipData(Object.entries(leadershipCounts).map(([name, value]) => ({
        name,
        value
      })));

      // Fetch impact areas data
      const { data: impactResults } = await supabase
        .from('SurveyAnswer')
        .select('aiImpactAreas');
      
      const impactCounts = {
        '简历筛选与评估': 0,
        '安排面试': 0,
        '知识库查询': 0,
        '自动生成JD': 0,
        '自动生成招聘沟通内容': 0,
        '会议纪要/面试记录': 0
      };
      
      impactResults?.forEach((result: ImpactResult) => {
        const areas = JSON.parse(result.aiImpactAreas);
        areas.forEach((area: string) => {
          if (area in impactCounts) {
            impactCounts[area as keyof typeof impactCounts]++;
          }
        });
      });
      
      setImpactData(Object.entries(impactCounts).map(([name, value]) => ({
        name,
        value
      })));
    } catch (error) {
      console.error('Error fetching survey data:', error);
      setSurveyData(DEFAULT_SURVEY_DATA);
    }
  };

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      setCurrentResumeIndex(0);
      setAnswers([]);
      setIsAIAnswer(null);
      setAgreeScoreAnswer(null);
      setGameState('playing');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('游戏启动失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeAnswer = async (isAI: boolean, agreeScore: boolean) => {
    const newAnswers = [...answers, { isAI, agreeScore }];
    setAnswers(newAnswers);

    if (currentResumeIndex < resumes.length - 1) {
      setCurrentResumeIndex(currentResumeIndex + 1);
      setIsAIAnswer(null);
      setAgreeScoreAnswer(null);
    } else {
      setGameState('survey');
    }
  };

  const handleConfirm = () => {
    if (isAIAnswer === null || agreeScoreAnswer === null) return;
    
    const currentResume = resumes[currentResumeIndex];
    const correct = isAIAnswer === currentResume.isAIGenerated;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      // Trigger confetti for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Update score
    setScore(prev => prev + (correct ? 1 : 0));
    
    // Move to next resume after a delay
    setTimeout(() => {
      setShowFeedback(false);
      if (currentResumeIndex < resumes.length - 1) {
        setCurrentResumeIndex(prev => prev + 1);
        setIsAIAnswer(null);
        setAgreeScoreAnswer(null);
      } else {
        setGameState('survey');
      }
    }, 2000);
  };

  const handleSurveySubmit = async () => {
    if (!surveyAnswers.aiUsageOpinion || !surveyAnswers.aiLeadership || 
        surveyAnswers.aiImpactAreas.length === 0) {
      alert('请完成所有必答题');
      return;
    }
    
    try {
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await submitSurveyAnswer({
        aiUsageOpinion: surveyAnswers.aiUsageOpinion,
        aiLeadership: surveyAnswers.aiLeadership,
        aiImpactAreas: JSON.stringify(surveyAnswers.aiImpactAreas),
        otherImpactArea: surveyAnswers.otherImpactArea || '',
        participantId
      });
      await fetchSurveyData();
      setGameState('result');
      setShowResults(false); // Ensure we show the guessing game first
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('提交失败，请重试');
    }
  };

  const handleAnswer = (isAI: boolean) => {
    const currentResume = resumes[currentResumeIndex];
    const correct = isAI === currentResume.isAIGenerated;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      // Trigger confetti for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Update score
    setScore(prev => prev + (correct ? 1 : 0));
    
    // Move to next resume after a delay
    setTimeout(() => {
      setShowFeedback(false);
      if (currentResumeIndex < resumes.length - 1) {
        setCurrentResumeIndex(prev => prev + 1);
      } else {
        setGameState('result');
      }
    }, 2000);
  };

  const handleGuess = () => {
    if (!guesses.opinion || !guesses.leadership || !guesses.impact) {
      alert('请完成所有三个问题的猜测');
      return;
    }

    const results = {
      opinion: guesses.opinion === surveyData.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current
      ).name,
      leadership: guesses.leadership === leadershipData.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current
      ).name,
      impact: guesses.impact === impactData.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current
      ).name
    };

    setGuessResults(results);
    setShowAllGuessResults(true);

    // Trigger confetti if at least one guess is correct
    if (Object.values(results).some(result => result)) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
    }

    // Show results after 3 seconds
    setTimeout(() => {
      setShowResults(true);
    }, 3000);
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
        <GameNav />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Background effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-30 animate-pulse delay-300"></div>
            <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-30 animate-pulse delay-700"></div>
            </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold mb-8">
                <motion.span
                  className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  候选人用 AI 写简历，
                </motion.span>
                <motion.span
                  className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  你能看得出吗？
                </motion.span>
              </h1>

              <motion.p
                className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                参与趣味小测验，猜猜哪些简历是
                <span className="text-blue-600 font-medium">"真人写的"</span>，
                哪些是
                <span className="text-purple-600 font-medium">AI 的产物</span>。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full filter blur-xl opacity-50 animate-pulse"></div>
              <Button
                size="lg"
                onClick={handleStartGame}
                  className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-16 py-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                disabled={isLoading}
              >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      加载中...
                    </span>
                  ) : (
                    '挑战开始！'
                  )}
              </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentPosition && resumes.length > 0) {
    const currentResume = resumes[currentResumeIndex];
    const canProceed = isAIAnswer !== null && agreeScoreAnswer !== null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
        <GameNav />
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
        </div>

        <div className="relative h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-12 gap-8"
            >
              {/* Job Description Panel */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="col-span-3"
              >
                <div className="sticky top-4">
                  <h2 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {currentPosition.title}
                    </span>
                  </h2>
                  <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 transform hover:scale-[1.02] transition-transform duration-300 border border-gray-100/50">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">职位描述</h3>
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                          h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                          h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                          p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                          strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                          ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                          li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                          a: ({node, ...props}) => <a className={markdownStyles.a} {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
                          code: ({node, ...props}) => <code className={markdownStyles.code} {...props} />,
                          pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
                          hr: ({node, ...props}) => <hr className={markdownStyles.hr} {...props} />,
                          table: ({node, ...props}) => <table className={markdownStyles.table} {...props} />,
                          th: ({node, ...props}) => <th className={markdownStyles.th} {...props} />,
                          td: ({node, ...props}) => <td className={markdownStyles.td} {...props} />,
                          img: ({node, ...props}) => <img className={markdownStyles.img} {...props} />
                        }}
                      >
                        {currentPosition.description}
                      </ReactMarkdown>
                  </div>
                </div>
              </div>
              </motion.div>

              {/* Resume Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-6"
              >
                <div className="sticky top-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                      简历 {currentResumeIndex + 1}/3
                    </h2>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl filter blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
                      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-100">
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">AI匹配度</div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full filter blur-md opacity-30 animate-pulse"></div>
                            <div className="relative text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {currentResume.aiScore}%
                  </div>
                  </div>
                          <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${currentResume.aiScore}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                            />
                </div>
              </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 transform hover:scale-[1.02] transition-transform duration-300 border border-gray-100/50">
                    <div className="markdown-content">
                      <ReactMarkdown
                        components={{
                          h1: ({node, ...props}) => <h1 className={markdownStyles.h1} {...props} />,
                          h2: ({node, ...props}) => <h2 className={markdownStyles.h2} {...props} />,
                          h3: ({node, ...props}) => <h3 className={markdownStyles.h3} {...props} />,
                          p: ({node, ...props}) => <p className={markdownStyles.p} {...props} />,
                          strong: ({node, ...props}) => <strong className={markdownStyles.strong} {...props} />,
                          ul: ({node, ...props}) => <ul className={markdownStyles.ul} {...props} />,
                          li: ({node, ...props}) => <li className={markdownStyles.li} {...props} />,
                          a: ({node, ...props}) => <a className={markdownStyles.a} {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className={markdownStyles.blockquote} {...props} />,
                          code: ({node, ...props}) => <code className={markdownStyles.code} {...props} />,
                          pre: ({node, ...props}) => <pre className={markdownStyles.pre} {...props} />,
                          hr: ({node, ...props}) => <hr className={markdownStyles.hr} {...props} />,
                          table: ({node, ...props}) => <table className={markdownStyles.table} {...props} />,
                          th: ({node, ...props}) => <th className={markdownStyles.th} {...props} />,
                          td: ({node, ...props}) => <td className={markdownStyles.td} {...props} />,
                          img: ({node, ...props}) => <img className={markdownStyles.img} {...props} />
                        }}
                      >
                        {currentResume.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Judgment Panel */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="col-span-3"
              >
                <div className="sticky top-4">
                  <h2 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      你的判断
                    </span>
                  </h2>
                  <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-6 border border-gray-100/50">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="space-y-4"
                    >
                      <h4 className="font-medium text-gray-800">该简历是否使用AI生成？</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant={isAIAnswer === true ? "default" : "outline"}
                          onClick={() => setIsAIAnswer(true)}
                          className={`relative overflow-hidden group h-12 ${
                            isAIAnswer === true ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                          }`}
                        >
                          <span className="relative z-10">是</span>
                          {isAIAnswer === true && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Button>
                        <Button 
                          variant={isAIAnswer === false ? "default" : "outline"}
                          onClick={() => setIsAIAnswer(false)}
                          className={`relative overflow-hidden group h-12 ${
                            isAIAnswer === false ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                          }`}
                        >
                          <span className="relative z-10">否</span>
                          {isAIAnswer === false && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      className="space-y-4"
                    >
                      <h4 className="font-medium text-gray-800">是否同意AI给出的匹配度评分？</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          variant={agreeScoreAnswer === true ? "default" : "outline"}
                          onClick={() => setAgreeScoreAnswer(true)}
                          className={`relative overflow-hidden group h-12 ${
                            agreeScoreAnswer === true ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                          }`}
                        >
                          <span className="relative z-10">是</span>
                          {agreeScoreAnswer === true && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Button>
                        <Button 
                          variant={agreeScoreAnswer === false ? "default" : "outline"}
                          onClick={() => setAgreeScoreAnswer(false)}
                          className={`relative overflow-hidden group h-12 ${
                            agreeScoreAnswer === false ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
                          }`}
                        >
                          <span className="relative z-10">否</span>
                          {agreeScoreAnswer === false && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            />
                          )}
                        </Button>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                      className="pt-4 border-t border-gray-100"
                    >
                      <Button
                        onClick={handleConfirm}
                        disabled={!canProceed}
                        className={`w-full relative overflow-hidden group h-12 ${
                          canProceed 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <span className="relative z-10">确定</span>
                        {canProceed && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                    </div>
                  </div>
              </motion.div>
            </motion.div>
                </div>
              </div>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`fixed inset-0 flex items-center justify-center ${
                isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}
            >
              <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                className={`text-4xl font-bold ${
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isCorrect ? '✓ 回答正确???' : '✗ 回答错误???'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (gameState === 'survey') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
        <GameNav />
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
        </div>

        <div className="relative h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                问卷调查
              </h2>
              <p className="text-xl text-gray-600">
                分享你对AI在招聘中应用的看法
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 space-y-8 border border-gray-100/50"
            >
              {/* Question 1 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-2xl font-bold text-gray-900">1. 你认为候选人在求职中可以使用AI吗？</h3>
                <div className="space-y-3">
                  {[
                    '可以接受，只要确保提供的信息真实可靠',
                    '可以接受，这是求职者掌握和运用现代科技能力的一部分',
                    '可以接受，但应有所限制，过度依赖AI可能会掩盖候选人的真实技能和创造力。',
                    '不接受，因为可能导致信息失真或不公平竞争',
                    '不接受，这可能会削弱求职过程中应有的个人努力和真实性',
                    '不确定/需要进一步观察'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                        surveyAnswers.aiUsageOpinion === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aiUsageOpinion"
                        value={option}
                        checked={surveyAnswers.aiUsageOpinion === option}
                        onChange={(e) => setSurveyAnswers(prev => ({
                          ...prev,
                          aiUsageOpinion: e.target.value
                        }))}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-4 text-lg text-gray-700">{option}</span>
                    </label>
                    ))}
                  </div>
              </motion.div>

              {/* Question 2 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4 pt-8 border-t border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900">2. 企业内部推动人工智能在人力资源管理中的应用应该：</h3>
                <div className="space-y-3">
                  {[
                    '由 IT 部门主导',
                    '由 HR部门主导',
                    '由公司高层管理（C-Suite）主导'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                        surveyAnswers.aiLeadership === option
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aiLeadership"
                        value={option}
                        checked={surveyAnswers.aiLeadership === option}
                        onChange={(e) => setSurveyAnswers(prev => ({
                          ...prev,
                          aiLeadership: e.target.value
                        }))}
                        className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-500"
                      />
                      <span className="ml-4 text-lg text-gray-700">{option}</span>
                    </label>
                  ))}
                  </div>
              </motion.div>

              {/* Question 3 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 pt-8 border-t border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-900">3. 在贵公司的招聘工作中，您认为人工智能在以下哪些方面的影响最大？（可多选，最多选3项）</h3>
                <div className="space-y-3">
                  {[
                    '简历筛选与评估',
                    '安排面试',
                    '知识库查询',
                    '自动生成JD',
                    '自动生成招聘沟通内容（如邮件、模板、申请表格等）',
                    '会议纪要/面试记录',
                    '其他'
                  ].map((option) => (
                    <label
                      key={option}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                        surveyAnswers.aiImpactAreas.includes(option)
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={surveyAnswers.aiImpactAreas.includes(option)}
                        onChange={(e) => {
                          const newAreas = e.target.checked
                            ? [...surveyAnswers.aiImpactAreas, option].slice(0, 3)
                            : surveyAnswers.aiImpactAreas.filter(area => area !== option);
                          setSurveyAnswers(prev => ({
                            ...prev,
                            aiImpactAreas: newAreas
                          }));
                        }}
                        disabled={!surveyAnswers.aiImpactAreas.includes(option) && 
                                surveyAnswers.aiImpactAreas.length >= 3}
                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-4 text-lg text-gray-700">{option}</span>
                    </label>
                  ))}
                  {surveyAnswers.aiImpactAreas.includes('其他') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                    <Input
                        placeholder="请详细说明"
                        value={surveyAnswers.otherImpactArea}
                        onChange={(e) => setSurveyAnswers(prev => ({
                          ...prev,
                          otherImpactArea: e.target.value
                        }))}
                        className="w-full p-4 text-lg border-2 border-indigo-200 focus:border-indigo-500 rounded-lg"
                      />
                    </motion.div>
                  )}
                  </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-8 border-t border-gray-100"
              >
                  <Button
                    onClick={handleSurveySubmit}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    提交
                  </Button>
              </motion.div>
            </motion.div>
                </div>
              </div>
            </div>
    );
  }

  if (gameState === 'result' && showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
        <GameNav />
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>
          </div>

        <div className="relative h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-3 gap-8">
              {/* Question 1 Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100/50 transform hover:scale-[1.02] transition-transform duration-300"
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  你认为候选人在求职中可以使用AI吗？
                </h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 40 }}>
                      <Pie
                        data={surveyData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent, value }) => 
                          value > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                        }
                      >
                        {surveyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="bottom" 
                        align="right"
                        wrapperStyle={{ 
                          paddingLeft: '20px',
                          fontSize: '14px',
                          lineHeight: '1.5'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Question 2 Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100/50 transform hover:scale-[1.02] transition-transform duration-300"
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  谁应该主导AI应用？
                </h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={leadershipData}
                      margin={{ top: 20, right: 30, bottom: 100, left: 20 }}
                    >
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={120}
                        interval={0}
                        tick={{ fontSize: 14 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Question 3 Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100/50 transform hover:scale-[1.02] transition-transform duration-300"
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  AI在招聘中的影响最大的领域？
                </h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart 
                      data={impactData}
                      margin={{ top: 20, right: 100, bottom: 20, left: 100 }}
                    >
                      <PolarGrid />
                      <PolarAngleAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, Math.max(...impactData.map(d => d.value)) * 1.2]} 
                      />
                      <Radar
                        name="影响程度"
                        dataKey="value"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-center"
            >
              <div className="inline-block bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100/50">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  倒计时: {countdown} 秒
                </div>
                <p className="text-gray-600">
                  页面将在倒计时结束后自动返回
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              <Button
                onClick={() => setGameState('idle')}
                className="relative overflow-hidden group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span className="relative z-10">立即返回</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result' && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
        <GameNav />
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>
        </div>

        <div className="relative h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                竞猜游戏
              </h1>
              <p className="text-2xl text-gray-600">
                猜猜其他HR最支持哪个观点？
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-8">
              {/* Left Column - Guessing Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 space-y-8 border border-gray-100/50 transform hover:scale-[1.02] transition-transform duration-300"
              >
                {/* Question 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      1. 你认为候选人在求职中可以使用AI吗？
                    </span>
                  </h2>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <select
                      value={guesses.opinion}
                      onChange={(e) => setGuesses(prev => ({ ...prev, opinion: e.target.value }))}
                      className="relative w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 appearance-none bg-white/90 backdrop-blur-sm"
                    >
                      <option value="">请选择...</option>
                      {surveyData.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
            </div>
            </div>
                  {showAllGuessResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        guessResults.opinion 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {guessResults.opinion ? (
                          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-lg font-medium ${
                          guessResults.opinion ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {guessResults.opinion ? '猜对了！' : '猜错了！'}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">
                        最受欢迎的观点是：{surveyData.reduce((prev, current) => 
                          (prev.value > current.value) ? prev : current
                        ).name}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Question 2 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4 pt-8 border-t border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      2. 谁应该主导AI应用？
                    </span>
                  </h2>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <select
                      value={guesses.leadership}
                      onChange={(e) => setGuesses(prev => ({ ...prev, leadership: e.target.value }))}
                      className="relative w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 appearance-none bg-white/90 backdrop-blur-sm"
                    >
                      <option value="">请选择...</option>
                      {leadershipData.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {showAllGuessResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        guessResults.leadership 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {guessResults.leadership ? (
                          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-lg font-medium ${
                          guessResults.leadership ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {guessResults.leadership ? '猜对了！' : '猜错了！'}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">
                        最受欢迎的选择是：{leadershipData.reduce((prev, current) => 
                          (prev.value > current.value) ? prev : current
                        ).name}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                {/* Question 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-4 pt-8 border-t border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      3. AI在招聘中的影响最大的领域？
                    </span>
                  </h2>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg filter blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <select
                      value={guesses.impact}
                      onChange={(e) => setGuesses(prev => ({ ...prev, impact: e.target.value }))}
                      className="relative w-full p-4 text-lg border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 appearance-none bg-white/90 backdrop-blur-sm"
                    >
                      <option value="">请选择...</option>
                      {impactData.map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {showAllGuessResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg ${
                        guessResults.impact 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {guessResults.impact ? (
                          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={`text-lg font-medium ${
                          guessResults.impact ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {guessResults.impact ? '猜对了！' : '猜错了！'}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">
                        最受欢迎的选择是：{impactData.reduce((prev, current) => 
                          (prev.value > current.value) ? prev : current
                        ).name}
                      </p>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="pt-8 border-t border-gray-100"
                >
              <Button
                    onClick={handleGuess}
                    disabled={!guesses.opinion || !guesses.leadership || !guesses.impact || showAllGuessResults}
                    className={`relative w-full h-14 text-lg font-semibold rounded-lg shadow-lg transform transition-all duration-200 overflow-hidden group ${
                      !guesses.opinion || !guesses.leadership || !guesses.impact || showAllGuessResults
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-[1.02]'
                    }`}
                  >
                    <span className="relative z-10">提交所有猜测</span>
                    {(!guesses.opinion || !guesses.leadership || !guesses.impact || showAllGuessResults) ? null : (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    )}
              </Button>
                </motion.div>
              </motion.div>

              {/* Right Column - Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8 border border-gray-100/50 transform hover:scale-[1.02] transition-transform duration-300"
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
                  你的选择
                </h2>
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50"
                  >
                    <div className="text-lg font-semibold text-gray-800 mb-2">AI使用态度</div>
                    <div className="text-xl text-gray-600">
                      {guesses.opinion || '尚未选择'}
            </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/50"
                  >
                    <div className="text-lg font-semibold text-gray-800 mb-2">主导部门</div>
                    <div className="text-xl text-gray-600">
                      {guesses.leadership || '尚未选择'}
          </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50"
                  >
                    <div className="text-lg font-semibold text-gray-800 mb-2">影响领域</div>
                    <div className="text-xl text-gray-600">
                      {guesses.impact || '尚未选择'}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {gameState === 'playing' && (
        <div className="max-w-4xl mx-auto p-6">
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              是
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              否
            </button>
          </div>

          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`fixed inset-0 flex items-center justify-center ${
                  isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}
              >
                <motion.div
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  className={`text-4xl font-bold ${
                    isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isCorrect ? '✓ 回答正确???' : '✗ 回答错误???'}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}