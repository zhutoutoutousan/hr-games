'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameNav } from '@/components/GameNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getSurveyData, submitSurveyAnswer } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

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

export default function TrueFalseCVPage() {
  const router = useRouter();
  const [currentPosition, setCurrentPosition] = useState(JOB_POSITIONS[0]);
  const [resumes, setResumes] = useState(RESUMES);
  const [currentResumeIndex, setCurrentResumeIndex] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'survey' | 'result'>('idle');
  const [surveyData, setSurveyData] = useState<any[]>([]);
  const [userOpinion, setUserOpinion] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ isAI: boolean; agreeScore: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIAnswer, setIsAIAnswer] = useState<boolean | null>(null);
  const [agreeScoreAnswer, setAgreeScoreAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const fetchSurveyData = async () => {
    try {
      const data = await getSurveyData();
      setSurveyData(data.length > 0 ? data : DEFAULT_SURVEY_DATA);
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
    handleResumeAnswer(isAIAnswer, agreeScoreAnswer);
  };

  const handleSurveySubmit = async () => {
    if (selectedRating === null) return;
    
    try {
      // Generate a unique participantId for this session
      const participantId = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await submitSurveyAnswer(selectedRating, userOpinion, participantId);
      await fetchSurveyData(); // Refresh survey data
      setGameState('result');
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('提交失败，请重试');
    }
  };

  const renderPieChart = () => (
    <div className="h-[500px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={surveyData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={200}
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
          <Tooltip 
            formatter={(value: number, name: string) => [`${value} 票`, name]}
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px'
            }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {surveyData.every(item => item.value === 0) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-lg">暂无数据</p>
        </div>
      )}
    </div>
  );

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <GameNav />
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                你认为候选人在求职中可以使用AI吗？
              </h1>
            </div>
            <div className="relative">
              {renderPieChart()}
            </div>
            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={handleStartGame}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? '加载中...' : '开始游戏'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentPosition && resumes.length > 0) {
    const currentResume = resumes[currentResumeIndex];
    const canProceed = isAIAnswer !== null && agreeScoreAnswer !== null;

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <GameNav />
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-3">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentPosition.title}</h2>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">职位描述</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{currentPosition.description}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="col-span-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">简历 {currentResumeIndex + 1}/3</h2>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">AI匹配度评分</h3>
                    <span className="text-blue-600 font-bold">{currentResume.aiScore}%</span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{currentResume.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">你的判断</h2>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">该简历是否使用AI生成？</h4>
                      <div className="flex gap-4">
                        <Button 
                          variant={isAIAnswer === true ? "default" : "outline"}
                          onClick={() => setIsAIAnswer(true)}
                          className="flex-1"
                        >
                          是
                        </Button>
                        <Button 
                          variant={isAIAnswer === false ? "default" : "outline"}
                          onClick={() => setIsAIAnswer(false)}
                          className="flex-1"
                        >
                          否
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">是否同意AI给出的匹配度评分？</h4>
                      <div className="flex gap-4">
                        <Button 
                          variant={agreeScoreAnswer === true ? "default" : "outline"}
                          onClick={() => setAgreeScoreAnswer(true)}
                          className="flex-1"
                        >
                          是
                        </Button>
                        <Button 
                          variant={agreeScoreAnswer === false ? "default" : "outline"}
                          onClick={() => setAgreeScoreAnswer(false)}
                          className="flex-1"
                        >
                          否
                        </Button>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleConfirm}
                        disabled={!canProceed}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        确定
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'survey') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <GameNav />
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                你认为候选人在求职中可以使用AI吗？
              </h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-6">
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant={selectedRating === rating ? "default" : "outline"}
                        onClick={() => setSelectedRating(rating)}
                        className="w-20"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>强烈反对</span>
                    <span>反对</span>
                    <span>中立</span>
                    <span>支持</span>
                    <span>强烈支持</span>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">我的看法</label>
                    <Input
                      value={userOpinion}
                      onChange={(e) => setUserOpinion(e.target.value)}
                      placeholder="请输入你的看法..."
                    />
                  </div>
                  <Button
                    onClick={handleSurveySubmit}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    提交
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <GameNav />
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                你认为候选人在求职中可以使用AI吗？
              </h1>
            </div>
            <div className="relative">
              {renderPieChart()}
            </div>
            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={() => setGameState('idle')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                重新开始
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}