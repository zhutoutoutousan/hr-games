'use client';

import { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/admin-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase, type Position, type Resume } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function AdminPanel() {
  const { logout } = useAdmin();
  const [positions, setPositions] = useState<Position[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newPosition, setNewPosition] = useState({
    title: '',
    description: '',
  });

  const [newResume, setNewResume] = useState({
    position_id: '',
    content: '',
    is_ai: false,
    matching_score: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [positionsResponse, resumesResponse] = await Promise.all([
        supabase.from('positions').select('*').order('created_at', { ascending: false }),
        supabase.from('resumes').select('*').order('created_at', { ascending: false })
      ]);

      if (positionsResponse.error) throw positionsResponse.error;
      if (resumesResponse.error) throw resumesResponse.error;

      setPositions(positionsResponse.data || []);
      setResumes(resumesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPosition = async () => {
    if (!newPosition.title || !newPosition.description) {
      toast.error('请填写完整的职位信息');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('positions')
        .insert([newPosition]);

      if (error) throw error;
      
      toast.success('职位添加成功');
      setNewPosition({ title: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('添加职位失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResume = async () => {
    if (!newResume.position_id || !newResume.content) {
      toast.error('请填写完整的简历信息');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('resumes')
        .insert([{
          position_id: parseInt(newResume.position_id),
          content: newResume.content,
          is_ai: newResume.is_ai,
          matching_score: newResume.matching_score,
        }]);

      if (error) throw error;
      
      toast.success('简历添加成功');
      setNewResume({
        position_id: '',
        content: '',
        is_ai: false,
        matching_score: 0,
      });
      loadData();
    } catch (error) {
      console.error('Error adding resume:', error);
      toast.error('添加简历失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurgeData = async () => {
    setIsLoading(true);
    try {
      const [positionsError, resumesError] = await Promise.all([
        supabase.from('positions').delete().neq('id', 0),
        supabase.from('resumes').delete().neq('id', 0)
      ]);

      if (positionsError.error) throw positionsError.error;
      if (resumesError.error) throw resumesError.error;

      toast.success('数据已清空');
      loadData();
    } catch (error) {
      console.error('Error purging data:', error);
      toast.error('清空数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">管理后台</h1>
        <div className="flex gap-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                清空数据
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认清空数据？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将删除所有职位和简历数据，且不可恢复。请确认是否继续？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handlePurgeData} className="bg-red-600 hover:bg-red-700">
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={logout} variant="outline">
            退出管理
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">添加新职位</h2>
        <div className="space-y-4">
          <div>
            <Label>职位名称</Label>
            <Input
              value={newPosition.title}
              onChange={(e) => setNewPosition({ ...newPosition, title: e.target.value })}
              placeholder="输入职位名称"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>职位描述</Label>
            <Textarea
              value={newPosition.description}
              onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
              placeholder="输入职位描述"
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleAddPosition} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '添加中...' : '添加职位'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">添加新简历</h2>
        <div className="space-y-4">
          <div>
            <Label>选择职位</Label>
            <select
              value={newResume.position_id}
              onChange={(e) => setNewResume({ ...newResume, position_id: e.target.value })}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
            >
              <option value="">选择职位</option>
              {positions.map((position) => (
                <option key={position.id} value={position.id}>
                  {position.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>简历内容</Label>
            <Textarea
              value={newResume.content}
              onChange={(e) => setNewResume({ ...newResume, content: e.target.value })}
              placeholder="输入简历内容"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label>AI匹配分数</Label>
            <Input
              type="number"
              value={newResume.matching_score}
              onChange={(e) => setNewResume({ ...newResume, matching_score: parseInt(e.target.value) })}
              placeholder="输入匹配分数"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_ai"
              checked={newResume.is_ai}
              onChange={(e) => setNewResume({ ...newResume, is_ai: e.target.checked })}
              disabled={isLoading}
            />
            <Label htmlFor="is_ai">AI生成</Label>
          </div>
          <Button 
            onClick={handleAddResume} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '添加中...' : '添加简历'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">当前数据</h2>
        <div className="space-y-8">
          {positions.map((position) => (
            <div key={position.id} className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{position.title}</h3>
              <p className="text-gray-600 mb-4">{position.description}</p>
              <div className="space-y-4">
                <h4 className="font-medium">关联简历：</h4>
                {resumes
                  .filter((resume) => resume.position_id === position.id)
                  .map((resume) => (
                    <div key={resume.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">
                          {resume.is_ai ? 'AI生成' : '人工撰写'}
                        </span>
                        <span className="text-blue-600">
                          匹配分数: {resume.matching_score}%
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{resume.content}</p>
                    </div>
                  ))}
                {resumes.filter((resume) => resume.position_id === position.id).length === 0 && (
                  <p className="text-gray-500 italic">暂无关联简历</p>
                )}
              </div>
            </div>
          ))}
          {positions.length === 0 && (
            <p className="text-gray-500 italic text-center">暂无职位数据</p>
          )}
        </div>
      </Card>
    </div>
  );
}