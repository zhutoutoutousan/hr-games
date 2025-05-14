'use client';

import { useState, useEffect } from 'react';
import { GameNav } from '@/components/GameNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus } from 'lucide-react';

interface GameStats {
  totalGames: number;
  totalResumes: number;
  totalAnswers: number;
  aiAccuracy: number;
  userAgreement: number;
}

interface GameData {
  id: string;
  createdAt: string;
  jobPosition: {
    id: string;
    title: string;
    description: string;
  };
  resumes: {
    id: string;
    content: string;
    aiScore: number;
    isAIGenerated: boolean;
    userAnswers: {
      id: string;
      isAI: boolean;
      agreeScore: boolean;
    }[];
  }[];
  surveyAnswer?: {
    id: string;
    rating: number;
    opinion: string;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [games, setGames] = useState<GameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: string; data: any } | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/games/admin');
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }
      const data = await response.json();
      setStats(data.stats);
      setGames(data.games);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (type: string, data: any) => {
    try {
      const response = await fetch('/api/games/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: type, data }),
      });
      if (!response.ok) throw new Error('Failed to create');
      await fetchData();
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  const handleUpdate = async (type: string, id: string, data: any) => {
    try {
      const response = await fetch('/api/games/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: type, id, data }),
      });
      if (!response.ok) throw new Error('Failed to update');
      await fetchData();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    try {
      const response = await fetch('/api/games/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: type, id }),
      });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <GameNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <GameNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">
            <p className="mb-4">Error: {error}</p>
            <Button onClick={fetchData}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <GameNav />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-500">
            <p className="mb-4">No data available</p>
            <Button onClick={fetchData}>Refresh</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <GameNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">True/False CV Game Admin</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Games</h3>
            <p className="text-2xl font-bold">{stats.totalGames}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Resumes</h3>
            <p className="text-2xl font-bold">{stats.totalResumes}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Answers</h3>
            <p className="text-2xl font-bold">{stats.totalAnswers}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">AI Accuracy</h3>
            <p className="text-2xl font-bold">{stats.aiAccuracy}%</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">User Agreement</h3>
            <p className="text-2xl font-bold">{stats.userAgreement}%</p>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="cards" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cards">Card View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            {/* Games List */}
            <div className="space-y-6">
              {games.map((game) => (
                <Card key={game.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{game.jobPosition.title}</h2>
                      <p className="text-sm text-gray-500">
                        {new Date(game.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingItem?.type === 'jobPosition' && editingItem?.data.id === game.jobPosition.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingItem({ type: 'jobPosition', data: game.jobPosition })}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Job Position</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Title</label>
                              <Input
                                value={editingItem?.data.title || ''}
                                onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, title: e.target.value } }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Description</label>
                              <Textarea
                                value={editingItem?.data.description || ''}
                                onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, description: e.target.value } }))}
                              />
                            </div>
                            <Button
                              onClick={() => {
                                handleUpdate('jobPosition', editingItem!.data.id, editingItem!.data);
                                setEditingItem(null);
                              }}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog open={deletingItem?.type === 'jobPosition' && deletingItem?.id === game.jobPosition.id} onOpenChange={(open) => !open && setDeletingItem(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingItem({ type: 'jobPosition', id: game.jobPosition.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job Position</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this job position? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                handleDelete('jobPosition', deletingItem!.id);
                                setDeletingItem(null);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {game.resumes.map((resume) => (
                      <div key={resume.id} className="border-t pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">AI Score: {resume.aiScore}%</p>
                            <p className="text-sm text-gray-500">
                              {resume.isAIGenerated ? 'AI Generated' : 'Human Written'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog open={editingItem?.type === 'resume' && editingItem?.data.id === resume.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setEditingItem({ type: 'resume', data: resume })}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Resume</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Content</label>
                                    <Textarea
                                      value={editingItem?.data.content || ''}
                                      onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, content: e.target.value } }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">AI Score</label>
                                    <Input
                                      type="number"
                                      value={editingItem?.data.aiScore || 0}
                                      onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, aiScore: parseInt(e.target.value) } }))}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={editingItem?.data.isAIGenerated || false}
                                      onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, isAIGenerated: e.target.checked } }))}
                                    />
                                    <label className="text-sm font-medium">AI Generated</label>
                                  </div>
                                  <Button
                                    onClick={() => {
                                      handleUpdate('resume', editingItem!.data.id, editingItem!.data);
                                      setEditingItem(null);
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog open={deletingItem?.type === 'resume' && deletingItem?.id === resume.id} onOpenChange={(open) => !open && setDeletingItem(null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setDeletingItem({ type: 'resume', id: resume.id })}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this resume? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      handleDelete('resume', deletingItem!.id);
                                      setDeletingItem(null);
                                    }}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{resume.content}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Card className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Job Position</TableHead>
                    <TableHead>Resumes</TableHead>
                    <TableHead>AI Generated</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>User Answers</TableHead>
                    <TableHead>Survey Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {games.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>{new Date(game.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{game.jobPosition.title}</p>
                          <p className="text-sm text-gray-500">{game.jobPosition.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {game.resumes.map((resume) => (
                          <div key={resume.id} className="mb-2">
                            <p className="text-sm">{resume.content.substring(0, 100)}...</p>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {game.resumes.map((resume) => (
                          <div key={resume.id} className="mb-2">
                            <p className="text-sm">{resume.isAIGenerated ? 'Yes' : 'No'}</p>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {game.resumes.map((resume) => (
                          <div key={resume.id} className="mb-2">
                            <p className="text-sm">{resume.aiScore}%</p>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {game.resumes.map((resume) => (
                          <div key={resume.id} className="mb-2">
                            {resume.userAnswers.map((answer) => (
                              <p key={answer.id} className="text-sm">
                                Guess: {answer.isAI ? 'AI' : 'Human'} | 
                                Agree: {answer.agreeScore ? 'Yes' : 'No'}
                              </p>
                            ))}
                          </div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {game.surveyAnswer ? (
                          <div>
                            <p className="text-sm">Rating: {game.surveyAnswer.rating}/5</p>
                            {game.surveyAnswer.opinion && (
                              <p className="text-sm text-gray-500">{game.surveyAnswer.opinion}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No survey</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={editingItem?.type === 'jobPosition' && editingItem?.data.id === game.jobPosition.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingItem({ type: 'jobPosition', data: game.jobPosition })}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Job Position</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Title</label>
                                  <Input
                                    value={editingItem?.data.title || ''}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, title: e.target.value } }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea
                                    value={editingItem?.data.description || ''}
                                    onChange={(e) => setEditingItem(prev => ({ ...prev!, data: { ...prev!.data, description: e.target.value } }))}
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    handleUpdate('jobPosition', editingItem!.data.id, editingItem!.data);
                                    setEditingItem(null);
                                  }}
                                >
                                  Save Changes
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <AlertDialog open={deletingItem?.type === 'jobPosition' && deletingItem?.id === game.jobPosition.id} onOpenChange={(open) => !open && setDeletingItem(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setDeletingItem({ type: 'jobPosition', id: game.jobPosition.id })}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Job Position</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this job position? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    handleDelete('jobPosition', deletingItem!.id);
                                    setDeletingItem(null);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 