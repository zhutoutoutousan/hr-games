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
import { Match, Person } from '@/types/match';
import { getRandomPeople } from '@/utils/utils';
import { useToast } from '@/components/ui/use-toast';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

const DEFAULT_SURVEY_DATA = [
  { name: '可以接受，只要确保提供的信息真实可靠', value: 0 },
  { name: '可以接受，这是求职者掌握和运用现代科技能力的一部分', value: 0 },
  { name: '可以接受，但应有所限制，过度依赖AI可能会掩盖候选人的真实技能和创造力。', value: 0 },
  { name: '不接受，因为可能导致信息失真或不公平竞争', value: 0 },
  { name: '不接受，这可能会削弱求职过程中应有的个人努力和真实性', value: 0 },
  { name: '不确定/需要进一步观察', value: 0 },
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
    title: '人力资源助理',
    description: `# 人力资源助理职位职责

## 招聘与入职管理
- 协助招聘工作，包括发布职位信息、筛选简历、安排面试等
- 负责员工入职和离职手续的办理，包括准备相关文件、办理入职/离职手续、更新人事系统等
- 管理人事档案和员工信息系统，确保信息的准确性和完整性

## 培训与发展
- 协助组织和协调员工培训与发展活动
- 负责员工考勤管理，统计和汇总考勤数据
- 协助处理员工社保、公积金等相关事宜

## 行政支持
- 负责办公室行政事务，包括办公用品采购、报销、会议安排等
- 为人力资源部门提供支持
- 协助处理员工关系相关事宜，例如员工咨询、投诉处理等
- 参与组织和策划员工活动，提升员工满意度
- 完成上级领导交办的其他人力资源相关工作

# 任职要求

## 教育背景与工作经验
- 本科及以上学历，人力资源管理或相关专业优先
- 1-3年人力资源相关工作经验，有助理或实习经验者优先

## 专业技能
- 熟悉人力资源管理的基本理论和流程
- 熟练使用办公软件，包括Word、Excel、PowerPoint等
- 熟悉人力资源管理系统者优先

## 个人素质
- 具备良好的沟通协调能力和人际交往能力
- 工作细致认真，责任心强，具有较强的执行力
- 具备一定的学习能力和解决问题能力`
  }
];

const RESUMES_GROUP_1 = [
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
（因职业发展更换城市）
1、部门氛围建设：生日会举办、团建组织、工会活动及福利发放等
2、党建事宜：三会一课召开、会议纪要撰写、收发文等、党费收缴等
3、行政及后勤：会议组织、会务服务、费用报销、供应商对接及按时付款、办公物品采买、固定资产盘点、合同管理、工商变更、印章管理等
4、相应台账建立并按时登记

### 国药控股(中国)融资租赁有限公司
**行政专员** | 2023.11-2024.05 (6个月)
（6个月短期合同）
1、负责办理公司公文（起草/审核公司总结、纪要、请示、报告、信息等
2、访客指引、电话接听、日常报修、文件快递收发
3、职场规划改造
4、行政工作：会议室管理、会务支持、固定资产管理、物资采购、行政费用预算及分析、日常费用核算报销、办公环境维护、保洁人员管理、供应商管理
5、会议策划与组织协调及实施（会议布置、车辆安排、酒店预订、餐饮接待）
6、其他工作：协助完成工会、行政等组织的团队活动及领导交办的其他事务
7、每月工作汇报，主要汇报当月工作内容及下月工作计划

### 成都华臣石油化工有限公司
**行政管理** | 2020.12-2023.10 (2年10个月)
石油行业国企子公司，具体工作内容如下：
1、工商及银行：资质申报、银行开户、配合税务部门检查及前期准备
2、人事：协助进行人员招聘，包括筛选简历、安排面试等；员工入离转调手续的办理，考勤统计等；社保公积金开户及缴费
3、负责日常行政工作: 处理公司领导或部门主任交办的临时事项；对外日常行政事务，外单位来访来电
4、办公室管理:保洁绿植安排、物资采购；后勤保障:固定资产盘点、公车管理；领导接待：餐厅、酒店预定及车辆安排；团建组织、策划、安排

## 项目经历
### 街道办党政办
**党政办助理** | 2018.07-2018.08 (1个月)
描述：日常接收文件，接听电话，打印文稿，会议记录。
职责：日常接收文件，接听电话，打印文稿，会议记录。

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
    isAIGenerated: false
  },
  {
    id: '2',
    content: `# 周丹
## 基本信息
- 33 岁
- 离职，正在找工作
- 四川师范大学 · 学前教育 · 本科 · 非统招

## 综合能力/个人亮点
- 适应能力 | 沟通协调能力 | 执行力 | 责任心 | 亲和力
- 本人有多年行政岗位工作经验，熟练掌握办公技能
- 性格随和、乐于助人，工作踏实认真、有责任心
- 具有较强的组织协调能力、紧急事件处理能力
- 具备良好的自学和自我管控能力，能够快速适应新环境

## 工作经历
### 北京梅赛德斯-奔驰销售服务有限公司成都分公司
**行政前台** | 2024.01-2024.09 (8个月)
1、负责前台电话的接听和转接工作；日常公司访客的接待、咨询和引见，及时与被访人员沟通
2、负责信件快递、报刊、文件的收发工作
3、维护前台环境，确保前台环境良好，对接供应商采购鲜花绿植等物品
4、公司日常维护及供应商对接工作，包括绿植养护、日常保洁、公司设备使用、修缮以及门禁管理，与大厦物业对接，包括意见反馈、通知转达、账单支付等
5、确保前台区域宣传片正常播放，定期巡视办公室工区，确保通道安全与工位摆设规范，展示公司良好形象
6、会议支持，包括并不限于会议前期准备、设备调试、会议订餐及会议室环境卫生等
7、负责办公用品及固定资产管理工作，协助各部门同事领取并登记、盘点，以及公司行政日常采购工作，包含不限于茶、咖啡以及日常办公室卫生清洁用品等
8、公司办公座位和钥匙管理，及时更新座位表等
9、办公室车辆管理（日常保养、充电等）
10、协助突发事件处理：应对突发事件，如办公设备故障、以及紧急工作安排等
11、协助做好企业文化建设，包括不限于协助公司活动开展（如家庭日、圣诞节等）
12、根据员工出差工作需求，协助业务部门预订机票、酒店，并做好报销工作

### 成都速展科技有限公司
**行政人事** | 2021.05-2024.01 (2年8个月)
1、日常行政事务管理：负责日常行政事务的安排与执行，包括办公用品的采购、资产管理、日常接待、考勤工作、办公设备、公共设施的日常管理和维护等工作
2、文件资料管理：负责各类文件、资料的管理与存档，确保文件资料的安全与保密
3、制度建设与执行：协助制定行政管理制度与流程，确保公司各项行政事务的规范执行
4、员工关怀与福利保障：负责员工福利保障，节假日员工福利的采购与发放，组织员工活动，提升员工满意度
5、负责监督公司服务工作，巡查办公区域环境卫生，包括绿植养护、工位整洁等，确保办公环境保持干净整洁
6、深入了解公司所处行业，结合业务发展计划，与用人部门高效协作，梳理招聘需求和岗位工作；招聘岗位如：主要招聘软件开发人员及市场推广人员等

### 成都有明堂互动科技有限公司
**行政人事** | 2019.03-2021.04 (2年1个月)
1、日常行政事务管理：负责日常行政事务的安排与执行，包括办公用品的采购、资产管理、日常接待、考勤工作、办公设备、公共设施的日常管理和维护等工作
2、文件资料管理：负责各类文件、资料的管理与存档，确保文件资料的安全与保密
3、制度建设与执行：协助制定行政管理制度与流程，确保公司各项行政事务的规范执行
4、员工关怀与福利保障：负责员工福利保障，节假日员工福利的采购与发放，组织员工活动，提升员工满意度
5、负责组织开展各种形式的企业文化活动，丰富员工业余生活，协助上级做好公司企业文化建设与推广
6、各类行政事项或突发事件的应急处理，完成领导交办或业务反馈的各类行政相关任务处理，提升行政工作价值
7、协助处理公司搬迁事宜，包括并不限于前期场地选择及入驻准备，跟进新办公室装修事宜、物资清点与打包管理、内外部沟通协调、选择搬家公司与协调监督、新办公室准备与检查、制定详细搬迁计划等
8、政府项目申报工作，申报国家及省市政府发布的相关企业补贴，如高企、科技创新研发项目、研发准备金、文创产品项目、美术著作权、软著、专利、版号、入驻国家级孵化器等等
9、人事日常工作，包含招聘管理、员工入离职管理、员工关系、培训与发展等

### 成都卓越动力科技有限公司
**行政人事** | 2017.12-2019.02 (1年2个月)
1、负责公司的日常行政运营办公支持，持续改善办公秩序及办公环境
2、负责公司行政固定资产、低值易耗品等管理工作，日常盘点及维护，需具备固定资产管理经验
3、负责日常供应商管理对接维护，包含（绿植、快递、物业等）
4、企业公众号号内容编辑及运营
5、员工关怀与福利保障：负责员工福利保障，节假日员工福利的采购与发放，组织员工活动，提升员工满意度
6、负责组织开展各种形式的企业文化活动，丰富员工业余生活，协助上级做好公司企业文化建设与推广
7、人事日常工作，包含招聘管理、员工入离职管理、员工关系、培训与发展等

### 成都盖亚互动信息技术有限公司
**人事专员** | 2016.11-2017.11 (1年)
1、负责公司人事招聘相关工作，招聘岗位如：客户端开发、服务器开发、产品、运营、运维等
2、办理员工入职、离职、转正、调岗等人事关系工作，建立新员工人事档案、更新公司花名册
3、负责社会保险、公积金的开户、增减、补缴及其他相关事宜
4、负责公司证照管理、资质年检办理及工商年检资料填报事宜等
5、协助领导处理劳动纠纷、及员工出现的各种人事问题
6、协助行政开展公司团建拓展、年会、生日会等活动

### 成都杰迈科技有限责任公司
**行政人事助理** | 2015.05-2016.10 (1年5个月)
1、协助公司人事招聘；招聘岗位如：客户端开发、服务器开发、测试、原画、动作、角色模型、策划、运营等
2、办理员工入职、离职、转正、调岗等人事关系工作，建立新员工人事档案、更新公司花名册
3、负责社会保险、公积金的开户、增减、补缴及其他相关事宜
4、协助领导制定公司相关行政管理制度，监督各种制度实行情况
5、负责办公用品、固定资产的采购、管理、盘点
6、协助部门领导拟定各类公文函件，做好信息上传下达工作
7、协助部门领导开展公司各类活动、会议、培训等

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
    id: '3',
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

const RESUMES_GROUP_2 = [
  {
    id: '4',
    content: `# 李敏
## 基本信息
- 27 岁
- 离职，正在找工作

## 综合能力/个人亮点
- 4年人力资源多模块经验，专注员工关系与组织合规，擅长通过制度设计与员工沟通前置化解矛盾
- 员工关系体系搭建、劳动法合规与员工沟通策略
- 组织政策落地与合规文化塑造
- 数据分析与HRIS系统优化、全流程生命周期维护（系统化问题诊断与优化）
- 员工满意度提升、跨文化沟通（英语/粤语/普通话）

## 工作经历
### 深圳北芯生命科技股份有限公司
**人力资源助理** | 2022.04 - 2025.04 (3年)
【员工关系与合规管理】
- 从0-1搭建公司员工手册体系：联合法务部完成政策编写及民主程序，覆盖600+员工，政策认同度提升至95%
- 劳动争议风险管理：梳理10+劳动争议案例并输出风险预防标准化处理流程，开展1次劳资风险赋能培训，提升管理人员用工合规意识，有效降低争议发生率
- 员工生命周期管理：标准化管控入职、转正、调岗、离职及合同续签等人事异动流程；主导考勤管理系统优化，通过数字化工具实现月度考勤数据100%准确率，推动人事业务处理效率提升35%
- 政府补贴申领：搭建人才补贴申领SOP及信息共享平台，成功申请50+人次，为员工提供补充福利，员工满意度提升20%，关键人才留任率提升5%

【组织发展与效能提升】
- 组织架构优化：负责起草并发布组织架构调整红头文件，维护组织架构图、部门职能说明书，协调政策宣贯会，确保政策合规性与信息转达准确率100%，文件差错率为0
- 发文管理：全流程管理任命文件签发，年均处理50+份，确保100%准确率，开展任职资格评价，0法律合规风险
- 数据诊断与决策支持：主导构建BI人事动态监测看板，覆盖人员结构、流动性、假勤三大核心模块，数据更新实时率100%；输出年度《人力健康度仪表盘》及季度《人事洞察报告》，直接支持2次组织架构调整及2024年人力预算优化

【培训体系搭建】
- 新员工培训体系设计：跨部门协作开发"文化-制度-产品"三维课程、特定岗位专项培训，覆盖率100%，试用期通过率提升至90%
- 领导力培养计划：协助落地实施中高层、骨干、高潜人才领导力项目，完成100+名学员资源调配，年度计划完成率100%

### 快手
**BPO运营 & HRSSC** | 2020.06 - 2021.12 (1年6个月) | 海外
【BPO运营 | Trust & Safety】
- 团队运管：统筹海外200+人团队日常运营，通过动态排班策略保障98% SLA达成率
- 项目落地推动：协调6个新项目上线（含跨时区协作），平均交付周期14天
- 数据分析：通过审核效率数据分析，优化资源分配模型，人均日处理量提升10%

【HRSSC | 人力资源部】
- 流程标准化：从0-1编写5类标准操作手册（入职/离职/户政等），其中校招协议签署SOP成为集团模板
- 流程数据化：重构入职办理流程，单环节耗时从1天缩短至半天

## 项目经历
### 业务导向型年度峰会 | 2024.12 - 2025.02 (2个月) | 深圳北芯生命科技股份有限公司
背景：主导研发体系120+人分会场全流程运营，并担任四大会场（研发/营销/生产/集团总部）600+人颁奖总控。
核心职责与价值创造：
- 战略导向型评优体系落地：设计研发专场'客户价值贡献'、'技术攻关'、"发明家"等6类定制化奖项，实施'部门提名-数据验证-研委会终审'三级评审机制，确保评选结果与公司技术战略100%对齐
- 多线程项目管理：搭建'1+N'会务管控体系，主责研发分会场全流程（议程设计/技术高管接待/研发文化动线布置），统筹四大会场颁奖环节标准化执行；创建动态排期表，实时协调颁奖嘉宾跨会场行程
- 全域物料供应链管理：建立'三审双备份'物资管理机制，完成4大会场33类奖项200+件奖杯证书的定制（材质/刻字/包装三级审核）

### HR体系建设项目 | 2023.04 - 2023.08 (4个月) | 深圳北芯生命科技股份有限公司
背景：总公司人事审批流程节点冗余、系统界面混乱问题，审批操作错误率高，员工对流程咨询量大。子公司沿用旧流程且缺乏维护，与总公司标准脱节，跨组织协作效率低下。
优化动作：
- 节点科学化：主导Offer、转正、离职、休假等7大核心流程优化设计及系统配置，明确划分审批层级节点及涉及角色
- 流程标准化：重构系统审批界面，统一必填字段、提示规则及操作指引，并主导子公司审批流程与总公司标准对齐，输出适配实施方案，100%实现流程标准化，审批操作错误率及咨询量下降50%
- 问题诊断与攻坚：针对子公司业务特性，设计灵活性审批模板，保留10%本地化流程，平衡效率与业务需求
- 系统自动化：定制自动触发审批逻辑报表（如试用期到期提醒、合同续签预警），人工干预环节减少70%
- 长效维护机制：输出流程维护SOP，明确责任人及更新频率，历史流程版本归档完整率100%

## 教育经历
### 悉尼大学
**国际关系** | 硕士 统招 | 2018.07 - 2021.10

### 深圳大学
**公共管理** | 本科 统招 | 2014.09 - 2018.06

## 技能标签
- 项目管理
- PowerBI
- XMind
- Photoshop（PS）
- EHR
- 员工关系
- 组织合规
- 流程优化
- 数据分析
- 培训体系搭建
- 劳动法合规

## 语言能力
- 英语(商务洽谈、IELTS)
- 普通话(同声翻译)
- 粤语(同声翻译)`,
    aiScore: 85,
    isAIGenerated: false
  },
  {
    id: '5',
    content: `# 赵强
## 基本信息
- 26 岁
- 在职，急寻新工作

## 综合能力/个人亮点
- 拥有两年多时间丰富的人力资源管理经验，曾在知名央企、知名港企担任专员/助理，熟悉国内和跨国企业的人力资源运作模式
- 本科毕业于安徽财经大学，具备扎实的理论基础，普通话流利，沟通无障碍
- 精通人力资源法规政策，善于协调团队，提升员工绩效，同时具备一定的市场敏感度和商业洞察力
- 敏锐的解决问题能力，能够在压力下高效完成任务，适应多变的工作环境

## 工作经历
### 新世界（香港）有限公司
**人力资源助理** | 2023.08 - 2024.01 (5个月)
- 负责公司招聘、员工入职离职等工作的综合管理
- 负责管理人事系统各项数据库
- 负责公司内部、外部各类培训
- 负责薪酬管理
- 负责各类会务工作
- 部分由主管交办的其他综合类事项

### 中核集团
**人力资源管理专员** | 2021.08 - 2023.07 (1年11个月)
- 协助公司招聘、员工入职离职等工作的综合管理
- 负责管理人事系统各项数据库
- 负责公司内部、外部各类培训
- 负责部分党建工作及各类会务工作
- 负责汇整统计员工出勤/休假等各项资料
- 负责部分由主管交办的其他综合类事项

## 项目经历
### 智慧富民——互联网背景下甘南藏族乡村旅游行业发展模式研究 | 2019.07 - 2021.06 (1年11个月) | 负责人
描述：此项目是我在大学本科阶段申报的国家级大学生创新创业训练项目，在此项目中我担任负责人。主要是为了帮助甘南藏族自治州乡村旅游资源的利用和开发所提供具有可行性的思路供借鉴。
职责：按个人优势寻找组队成员、联系导师、商讨项目策划书并完成，完成项目中期检查与答辩; 分配团队成员任务、协作完成结项论文撰写并发表。
业绩：国家级大学生创新训练项目

## 教育经历
### 安徽财经大学
**人力资源管理** | 本科 统招 | 2017.09 - 2021.07

## 技能标签
- 人力资源管理
- 招聘管理
- 员工关系
- 培训管理
- 薪酬管理
- 人事系统管理
- 项目管理
- 团队协调

## 语言能力
- 普通话（流利）`,
    aiScore: 78,
    isAIGenerated: false
  },
  {
    id: '6',
    content: `# 张明
## 基本信息
- 24 岁
- 离职，正在积极寻找新工作

## 综合能力/个人亮点
- 具备扎实的人力资源管理理论基础，熟悉招聘、入离职、培训、考勤、社保福利等各项流程
- 拥有近2年人力资源助理工作经验，熟练运用办公软件和HRIS系统
- 具备良好的沟通协调能力和执行力，工作细致认真，责任心强，能够快速学习并独立完成任务
- 热衷于人力资源工作，致力于为员工提供优质的服务

## 工作经历
### 星辰科技（苏州）有限公司
**人力资源助理** | 2023.06 - 2025.05
- 招聘支持：协助招聘专员发布职位信息，通过线上平台筛选简历，电话沟通候选人，安排初试和复试，参与面试过程，每月成功邀约面试候选人超过50人，有效支撑团队的人才需求
- 入离职管理：负责新员工的入职手续办理，包括准备入职材料、签订劳动合同、办理工号和办公用品等；协助办理员工离职手续，确保流程顺畅
- 人事系统管理：负责维护和更新公司"云人事"HRIS系统中的员工信息，确保数据的准确性和完整性；定期生成各类人事报表，为部门决策提供数据支持
- 培训协助：协助组织公司内部培训活动，包括培训需求的调研、场地和讲师的协调、培训资料的准备和分发、培训效果的跟踪和反馈
- 考勤管理：负责员工的日常考勤管理，收集和核对考勤数据，处理请假、加班等申请，每月按时生成考勤报表，确保考勤数据的准确性
- 社保福利：协助办理员工的社会保险和住房公积金的开户、缴纳、转移等手续，解答员工在社保福利方面的疑问
- 行政支持：负责人力资源部门的日常行政事务，包括办公用品的采购和管理、部门费用的报销、会议的组织和记录等，保障部门工作的顺利进行
- 员工关系：积极参与员工沟通和关怀活动，协助处理员工的日常咨询和反馈，营造积极和谐的工作氛围
- 员工活动：参与策划和组织公司员工活动，如团建、节日庆祝等，提升员工的归属感和满意度
- 其他工作：完成上级领导交办的其他人力资源相关工作，例如协助进行员工满意度调查、参与人力资源政策的优化等

### 微光创新科技（深圳）有限公司
**人力资源实习生** | 2022.07 - 2023.05
- 协助进行简历筛选和初步面试
- 参与员工档案的整理和归档工作
- 协助组织员工培训活动
- 负责办公室日常行政事务

## 教育经历
### 星海财经大学
**人力资源管理** | 本科 统招 | 2018.09 - 2022.06

## 技能标签
- 人力资源管理
- 招聘流程
- 员工关系
- 培训与发展
- 薪酬福利
- 考勤管理
- HRIS系统操作（云人事）
- Microsoft Office (熟练掌握Excel)
- 沟通协调
- 执行力
- 责任心
- 学习能力

## 语言能力
- 普通话（流利）
- 英语（四级）

## 附加信息
- 获得人力资源管理师（三级）证书
- 熟悉国家和地方的劳动法律法规`,
    aiScore: 95,
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

interface Resume {
  id: string;
  content: string;
  aiScore: number;
  isAIGenerated: boolean;
  jobPositionId: string;
  createdAt: string;
  updatedAt: string;
}

type GameState = 'idle' | 'playing' | 'result' | 'survey';

export default function TrueFalseCVGame() {
  const router = useRouter();
  const [currentPosition, setCurrentPosition] = useState(() => {
    // Randomly select one job position
    const randomIndex = Math.random() < 0.5 ? 0 : 1;
    return JOB_POSITIONS[randomIndex];
  });
  const [resumes, setResumes] = useState(() => {
    // Select the corresponding resume group based on the job position
    const group = currentPosition.id === '1' ? RESUMES_GROUP_1 : RESUMES_GROUP_2;
    // Shuffle the resumes within the group
    return group.sort(() => Math.random() - 0.5);
  });
  const [currentResumeIndex, setCurrentResumeIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(60);
  const [surveyData, setSurveyData] = useState(DEFAULT_SURVEY_DATA);
  const [leadershipData, setLeadershipData] = useState<{ name: string; value: number }[]>([]);
  const [impactData, setImpactData] = useState<{ name: string; value: number }[]>([]);
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
  const [streamedMatches, setStreamedMatches] = useState<Match[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [userProfile, setUserProfile] = useState<Person | null>(null);
  const [email, setEmail] = useState('');
  const [myMatches, setMyMatches] = useState<Match[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<Person[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchingViewStage, setMatchingViewStage] = useState<'all-participants' | 'shuffle' | 'analysis' | 'results' | 'countdown'>('all-participants');
  const { toast } = useToast();

  useEffect(() => {
    fetchSurveyData();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'result') {
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
  }, [gameState]);

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
    setShowFeedback(false);


    // Update score
    setScore(prev => prev + (correct ? 1 : 0));
    
    if (currentResumeIndex < resumes.length - 1) {
      setCurrentResumeIndex(prev => prev + 1);
      setIsAIAnswer(null);
      setAgreeScoreAnswer(null);
    } else {
      setGameState('survey');
    }
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
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('提交失败，请重试');
    }
  };

  const handleAnswer = (isAI: boolean) => {
    const currentResume = resumes[currentResumeIndex];
    const correct = isAI === currentResume.isAIGenerated;
    setIsCorrect(correct);

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
      if (currentResumeIndex < resumes.length - 1) {
        setCurrentResumeIndex(prev => prev + 1);
      } else {
        setGameState('result');
      }
    }, 1000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast({
        title: "匹配失败",
        description: "用户信息不完整，请重试",
        variant: "destructive"
      });
      return;
    }

    setGameState('playing');
    setMatchingViewStage('all-participants');
    setIsStreaming(true);
    setStreamedMatches([]);
    
    try {
      // Get all available people except yourself
      const availablePeople = people.filter((person: Person) => 
        person.email !== email
      );

      // Get people who have matched with you (where you are the matchedWithId)
      const { data: matchesWithMe } = await supabase
        .from('Match')
        .select(`
          id,
          score,
          createdAt,
          updatedAt,
          participantId,
          matchedWithId,
          isActive,
          reasoning,
          reasoning_steps,
          People!Match_participantId_fkey (
            id,
            name,
            email,
            gender,
            industry,
            position,
            hobbies,
            hrConcern,
            socialPreference,
            avatarRequest
          )
        `)
        .eq('matchedWithId', userProfile.id)
        .eq('isActive', true);

      // Get your matches (where you are the participantId)
      const { data: myMatchesData } = await supabase
        .from('Match')
        .select(`
          id,
          score,
          createdAt,
          updatedAt,
          participantId,
          matchedWithId,
          isActive,
          reasoning,
          reasoning_steps,
          People!Match_matchedWithId_fkey (
            id,
            name,
            email,
            gender,
            industry,
            position,
            hobbies,
            hrConcern,
            socialPreference,
            avatarRequest
          )
        `)
        .eq('participantId', userProfile.id)
        .eq('isActive', true);

      // Combine both types of matches
      const allMatches = [
        ...(matchesWithMe || []).map(match => ({
          id: match.id,
          score: match.score,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt,
          participantId: match.participantId,
          matchedWithId: match.matchedWithId,
          isActive: match.isActive,
          person: match.People[0], // Get the first (and only) person from the relation
          reasoning: match.reasoning,
          reasoning_steps: match.reasoning_steps
        })),
        ...(myMatchesData || []).map(match => ({
          id: match.id,
          score: match.score,
          createdAt: match.createdAt,
          updatedAt: match.updatedAt,
          participantId: match.participantId,
          matchedWithId: match.matchedWithId,
          isActive: match.isActive,
          person: match.People[0], // Get the first (and only) person from the relation
          reasoning: match.reasoning,
          reasoning_steps: match.reasoning_steps
        }))
      ].filter(match => match.person); // Remove any undefined persons

      // Get new random people for matching
      const unmatchedPeople = availablePeople.filter(person => 
        !allMatches.some(match => 
          match.person.id === person.id
        )
      );

      const randomPeople = getRandomPeople(unmatchedPeople, 5);
      setSelectedPeople(randomPeople);
      
      // Create initial matches with placeholder scores
      const initialMatches = randomPeople.map((person: Person) => ({
        id: person.id.toString(),
        score: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        participantId: userProfile.id,
        matchedWithId: person.id,
        isActive: true,
        person,
        reasoning: 'AI分析中...',
        reasoning_steps: ['正在分析匹配度...']
      }));

      setMatches([...allMatches, ...initialMatches]);
      setStreamedMatches([...allMatches, ...initialMatches]);
      
      // Start the cinematic sequence
      setTimeout(() => setMatchingViewStage('shuffle'), 2000);
      setTimeout(() => setMatchingViewStage('analysis'), 4000);
      
      const response = await fetch('/api/deepseek/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: {
            ...userProfile,
            participantId: userProfile.name
          },
          candidates: randomPeople
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get match');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const newMatches: Match[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'match') {
                  if (data.data.person.name !== userProfile.name && newMatches.length < 5) {
                    const existingIndex = newMatches.findIndex(m => m.person.id === data.data.person.id);
                    if (existingIndex === -1) {
                      newMatches.push({
                        ...data.data,
                        score: data.data.match_score,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        participantId: userProfile.id,
                        matchedWithId: data.data.person.id,
                        isActive: true
                      });
                      // Immediately update streamed matches
                      setStreamedMatches(prev => {
                        const updated = [...prev];
                        const index = updated.findIndex(m => m.person.id === data.data.person.id);
                        if (index !== -1) {
                          updated[index] = {
                            ...data.data,
                            score: data.data.match_score,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            participantId: userProfile.id,
                            matchedWithId: data.data.person.id,
                            isActive: true
                          };
                        }
                        return updated;
                      });
                      // Show results stage as soon as we get the first match
                      if (newMatches.length === 1) {
                        setMatchingViewStage('results');
                      }
                    }
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (error) {
                console.error('Error parsing match data:', error);
              }
            }
          }
        }
      }

      if (newMatches.length > 0) {
        // Save new matches to database
        for (const match of newMatches) {
          await supabase.from('matches').insert({
            person_id: userProfile.id,
            matched_person_id: match.person.id,
            match_score: match.match_score,
            reasoning: match.reasoning,
            reasoning_steps: match.reasoning_steps
          });
        }

        setMatches([...allMatches, ...newMatches]);
        
        // Start countdown after all results are shown
        setTimeout(() => {
          setMatchingViewStage('countdown');
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
              clearInterval(countdownInterval);
              setGameState('result');
            }
          }, 1000);
        }, 2000);
      }
    } catch (error) {
      console.error('Error in matching process:', error);
      toast({
        title: "匹配失败",
        description: "获取匹配结果失败，请重试",
        variant: "destructive"
      });
      setGameState('idle');
    } finally {
      setIsStreaming(false);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
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
                {isCorrect ? '✓ 回答正确！' : '✗ 回答错误！'}
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
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 animate-pulse delay-300"></div>
        </div>

        <div className="relative h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                问卷调查
              </h1>
              <p className="text-xl text-gray-600">
                分享你对AI在招聘中应用的看法
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Survey Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 space-y-6 border border-gray-100/50"
              >
                {/* Question 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      1. 你认为候选人在求职中可以使用AI吗？
                    </span>
              </h2>
                  <div className="space-y-2">
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
                        className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
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
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-base text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>

                {/* Question 2 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 pt-6 border-t border-gray-100"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      2. 谁应该主导AI应用？
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {[
                      '由 IT 部门主导',
                      '由 HR部门主导',
                      '由公司高层管理（C-Suite）主导'
                    ].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
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
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="ml-3 text-base text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>

                {/* Question 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 pt-6 border-t border-gray-100"
                >
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                      3. AI在招聘中的影响最大的领域？
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {[
                      '简历筛选与评估',
                      '安排面试',
                      '知识库查询',
                      '自动生成JD',
                      '自动生成招聘沟通内容',
                      '会议纪要/面试记录',
                      '其他'
                    ].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:scale-[1.01] ${
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
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-3 text-base text-gray-700">{option}</span>
                      </label>
                    ))}
                    {surveyAnswers.aiImpactAreas.includes('其他') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2"
                      >
                    <Input
                          placeholder="请详细说明"
                          value={surveyAnswers.otherImpactArea}
                          onChange={(e) => setSurveyAnswers(prev => ({
                            ...prev,
                            otherImpactArea: e.target.value
                          }))}
                          className="w-full p-3 text-base border-2 border-indigo-200 focus:border-indigo-500 rounded-lg"
                    />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-6 border border-gray-100/50"
              >
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  你的选择
                </h2>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50"
                  >
                    <div className="text-base font-semibold text-gray-800 mb-1">AI使用态度</div>
                    <div className="text-lg text-gray-600">
                      {surveyAnswers.aiUsageOpinion || '尚未选择'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100/50"
                  >
                    <div className="text-base font-semibold text-gray-800 mb-1">主导部门</div>
                    <div className="text-lg text-gray-600">
                      {surveyAnswers.aiLeadership || '尚未选择'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50"
                  >
                    <div className="text-base font-semibold text-gray-800 mb-1">影响领域</div>
                    <div className="text-lg text-gray-600">
                      {surveyAnswers.aiImpactAreas.length > 0 
                        ? surveyAnswers.aiImpactAreas.join('、')
                        : '尚未选择'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="pt-4 border-t border-gray-100"
                  >
                  <Button
                    onClick={handleSurveySubmit}
                      disabled={!surveyAnswers.aiUsageOpinion || !surveyAnswers.aiLeadership || 
                               surveyAnswers.aiImpactAreas.length === 0}
                      className={`relative w-full h-12 text-base font-semibold rounded-lg shadow-lg transform transition-all duration-200 overflow-hidden group ${
                        !surveyAnswers.aiUsageOpinion || !surveyAnswers.aiLeadership || 
                        surveyAnswers.aiImpactAreas.length === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl hover:scale-[1.02]'
                      }`}
                    >
                      <span className="relative z-10">提交</span>
                      {(!surveyAnswers.aiUsageOpinion || !surveyAnswers.aiLeadership || 
                        surveyAnswers.aiImpactAreas.length === 0) ? null : (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      )}
                  </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
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
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  对AI生成简历的态度
                </h2>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={surveyData}
                      margin={{ top: 20, right: 30, bottom: 150, left: 20 }}
                      layout="vertical"
                    >
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        width={200}
                        tick={{ fontSize: 14 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        {surveyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
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
        </div>
      )}
    </div>
  );
}