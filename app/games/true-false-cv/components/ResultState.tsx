import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, 
  PieChart, Pie, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadarChart as RechartsRadarChart
} from 'recharts';
import { ResultStateProps } from '../types';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ChartData {
  name: string;
  value: number;
}

// Define colors for the chart bars
const COLORS = [
  'rgb(0,101,240)',  // Brand color
  '#4CAF50',         // Green
  '#FFC107',         // Amber
  '#9C27B0',         // Purple
  '#FF5722',         // Deep Orange
  '#00BCD4',         // Cyan
  '#FF9800',         // Orange
  '#795548',         // Brown
  '#607D8B',         // Blue Grey
  '#E91E63'          // Pink
];

export function ResultState({
  isMobile
}: ResultStateProps) {
  const [aiUsageData, setAiUsageData] = useState<ChartData[]>([]);
  const [aiLeadershipData, setAiLeadershipData] = useState<ChartData[]>([]);
  const [aiImpactData, setAiImpactData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        console.log('Starting survey data fetch in ResultState...');
        setIsLoading(true);

        // Fetch all survey data
        const { data: surveyResults, error } = await supabase
          .from('SurveyAnswer')
          .select('*');

        if (error) {
          console.error('Error fetching survey data:', error);
          return;
        }

        console.log('Raw survey results:', surveyResults);

        // Process AI Usage Opinion data
        const usageCounts = {
          '可以接受，只要确保提供的信息真实可靠': 0,
          '可以接受，这是求职者掌握和运用现代科技能力的一部分': 0,
          '可以接受，但应有所限制': 0,
          '不接受，因为可能导致信息失真': 0,
          '不接受，这可能会削弱求职过程中应有的个人努力': 0,
          '不确定/需要进一步观察': 0
        };

        // Process AI Leadership data
        const leadershipCounts = {
          '由科技部门主导': 0,
          '由业务部门主导': 0,
          '由公司高层管理（C-Suite）主导': 0
        };

        // Process AI Impact Areas data
        const impactCounts = {
          '简历筛选与评估': 0,
          '安排面试': 0,
          '知识库查询': 0,
          '自动生成JD': 0,
          '自动生成招聘沟通内容': 0,
          '会议纪要/面试记录': 0,
          '其他': 0
        };

        // Process the data
        surveyResults.forEach((result: any) => {
          // Count AI Usage Opinion
          if (result.aiUsageOpinion && result.aiUsageOpinion in usageCounts) {
            usageCounts[result.aiUsageOpinion as keyof typeof usageCounts]++;
          }

          // Count AI Leadership
          if (result.aiLeadership && result.aiLeadership in leadershipCounts) {
            leadershipCounts[result.aiLeadership as keyof typeof leadershipCounts]++;
          }

          // Count AI Impact Areas
          if (result.aiImpactAreas) {
            try {
              const areas = typeof result.aiImpactAreas === 'string' 
                ? JSON.parse(result.aiImpactAreas)
                : result.aiImpactAreas;

              if (Array.isArray(areas)) {
                areas.forEach((area: string) => {
                  if (area in impactCounts) {
                    impactCounts[area as keyof typeof impactCounts]++;
                  }
                });
              }
            } catch (error) {
              console.error('Error parsing impact areas:', error, 'Raw data:', result.aiImpactAreas);
            }
          }
        });

        // Convert counts to chart data format
        setAiUsageData(Object.entries(usageCounts).map(([name, value]) => ({ name, value })));
        setAiLeadershipData(Object.entries(leadershipCounts).map(([name, value]) => ({ name, value })));
        setAiImpactData(Object.entries(impactCounts).map(([name, value]) => ({ name, value })));

        console.log('Processed data:', {
          usage: Object.entries(usageCounts),
          leadership: Object.entries(leadershipCounts),
          impact: Object.entries(impactCounts)
        });

      } catch (error) {
        console.error('Error in fetchSurveyData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurveyData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-[rgb(0,101,240)] text-xl">Loading survey results...</div>
      </div>
    );
  }

  // Mobile Layout with CSS Effects
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4 space-y-6 pb-8">
            <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent sticky top-0 bg-white/90 backdrop-blur-sm py-4 z-10">
              调查结果
            </h2>

            {/* AI Usage Opinion Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-[rgb(0,101,240)]">AI使用态度分布</h3>
              <div className="space-y-3">
                {aiUsageData.map((item, index) => (
                  <div key={index} className="relative">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">{item.name}</span>
                      <span className="text-sm font-medium text-[rgb(0,101,240)]">{item.value}人</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / Math.max(...aiUsageData.map(d => d.value))) * 100}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, ${COLORS[(index + 1) % COLORS.length]})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Leadership Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-[rgb(0,101,240)]">AI实施主导部门</h3>
              <div className="grid grid-cols-1 gap-4">
                {aiLeadershipData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-blue-50 rounded-lg shadow-sm"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-[rgb(0,101,240)] mr-2">{item.value}</span>
                      <span className="text-sm text-gray-500">人</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* AI Impact Areas Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4 text-[rgb(0,101,240)]">AI影响领域分布</h3>
              <div className="grid grid-cols-2 gap-3">
                {aiImpactData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="relative p-3 bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[rgb(0,101,240)]/5 to-transparent"></div>
                    <div className="relative">
                      <span className="text-sm text-gray-700 block mb-1">{item.name}</span>
                      <div className="flex items-center">
                        <span className="text-xl font-bold text-[rgb(0,101,240)]">{item.value}</span>
                        <span className="text-xs text-gray-500 ml-1">人</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout - Compact View
  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50 to-white">
      <div className="h-full p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 flex flex-col"
        >
          <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[rgb(0,101,240)] to-blue-400 bg-clip-text text-transparent">
            调查结果
          </h2>

          <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Left Column */}
            <div className="space-y-6 min-h-0">
              {/* AI Usage Opinion Chart */}
              <div className="h-[45%] bg-white/50 rounded-xl p-4 shadow-lg min-h-0">
                <h3 className="text-lg font-semibold mb-3 text-[rgb(0,101,240)]">AI使用态度分布</h3>
                <div className="h-[calc(100%-2rem)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={aiUsageData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,101,240,0.1)" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fill: 'rgb(0,101,240)', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="value" fill="rgb(0,101,240)">
                        {aiUsageData.map((entry: ChartData, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Leadership Chart */}
              <div className="h-[45%] bg-white/50 rounded-xl p-4 shadow-lg min-h-0">
                <h3 className="text-lg font-semibold mb-3 text-[rgb(0,101,240)]">AI实施主导部门</h3>
                <div className="h-[calc(100%-2rem)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={aiLeadershipData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,101,240,0.1)" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fill: 'rgb(0,101,240)', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="value" fill="rgb(0,101,240)">
                        {aiLeadershipData.map((entry: ChartData, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column - Radar Chart */}
            <div className="bg-white/50 rounded-xl p-4 shadow-lg min-h-0">
              <h3 className="text-lg font-semibold mb-3 text-[rgb(0,101,240)]">AI影响领域分布</h3>
              <div className="h-[calc(100%-2rem)]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={aiImpactData}>
                    <PolarGrid stroke="rgba(0,101,240,0.1)" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tick={{ fill: 'rgb(0,101,240)', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      tick={{ fill: 'rgb(0,101,240)', fontSize: 12 }}
                    />
                    <Radar
                      name="Impact Areas"
                      dataKey="value"
                      stroke="rgb(0,101,240)"
                      fill="rgb(0,101,240)"
                      fillOpacity={0.6}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 