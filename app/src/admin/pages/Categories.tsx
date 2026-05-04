import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  FolderOpen,
} from 'lucide-react';
import type { Category } from '../types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', sort_order: 0, is_show: true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.getCategories(1);
      setCategories(res.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await apiClient.updateCategory(editItem.id, { ...form, store_id: 1 });
      } else {
        await apiClient.createCategory({ ...form, store_id: 1 });
      }
      setOpen(false);
      setEditItem(null);
      setForm({ name: '', sort_order: 0, is_show: true });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该分类？')) return;
    try {
      await apiClient.deleteCategory(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (cat: Category) => {
    setEditItem(cat);
    setForm({ name: cat.name, sort_order: cat.sort_order, is_show: cat.is_show });
    setOpen(true);
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === categories.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newList = [...categories];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setCategories(newList);
    // Update sort orders
    for (let i = 0; i < newList.length; i++) {
      await apiClient.updateCategory(newList[i].id, { sort_order: i + 1 });
    }
  };

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">共 {categories.length} 个分类</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#FF6B35] hover:bg-[#e55a2b]"
              onClick={() => {
                setEditItem(null);
                setForm({ name: '', sort_order: categories.length + 1, is_show: true });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> 添加分类
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? '编辑分类' : '添加分类'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>分类名称</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="如：热菜"
                />
              </div>
              <div className="space-y-2">
                <Label>排序号</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_show}
                  onCheckedChange={(checked) => setForm({ ...form, is_show: checked })}
                />
                <Label>显示</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full bg-[#FF6B35] hover:bg-[#e55a2b]">
                {editItem ? '保存修改' : '添加'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">排序</TableHead>
              <TableHead>分类名称</TableHead>
              <TableHead>显示状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat, index) => (
              <TableRow key={cat.id} className="hover:bg-slate-50/60">
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-slate-500 w-5">{cat.sort_order}</span>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveItem(index, 'up')}>
                      <ArrowUp className="w-3 h-3 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveItem(index, 'down')}>
                      <ArrowDown className="w-3 h-3 text-slate-400" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_show ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {cat.is_show ? '显示' : '隐藏'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B35]" onClick={() => openEdit(cat)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>暂无分类，点击添加</p>
        </div>
      )}
    </div>
  );
}
