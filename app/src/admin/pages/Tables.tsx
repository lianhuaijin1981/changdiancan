import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Plus,
  QrCode,
  Pencil,
  Users,
  Armchair,
} from 'lucide-react';
import type { Table } from '../types';

const statusMap: Record<string, { label: string; color: string }> = {
  free: { label: '空闲', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  dining: { label: '就餐中', color: 'bg-red-100 text-red-700 border-red-200' },
  reserved: { label: '已预订', color: 'bg-amber-100 text-amber-700 border-amber-200' },
};

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [form, setForm] = useState<{ table_no: string; capacity: number; status: string }>({ table_no: '', capacity: 4, status: 'free' });

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.getTables(1);
      setTables(res.tables || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editTable) {
        await apiClient.updateTable(editTable.id, { ...form, store_id: 1 } as any);
      } else {
        await apiClient.createTable({ ...form, store_id: 1 } as any);
      }
      setOpen(false);
      setEditTable(null);
      setForm({ table_no: '', capacity: 4, status: 'free' });
      fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (table: Table) => {
    setEditTable(table);
    setForm({ table_no: table.table_no, capacity: table.capacity, status: table.status });
    setOpen(true);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">共 {tables.length} 张桌台</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#FF6B35] hover:bg-[#e55a2b]"
              onClick={() => {
                setEditTable(null);
                setForm({ table_no: '', capacity: 4, status: 'free' });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> 添加桌台
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editTable ? '编辑桌台' : '添加桌台'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>桌台编号</Label>
                <Input
                  value={form.table_no}
                  onChange={(e) => setForm({ ...form, table_no: e.target.value })}
                  placeholder="如：A01"
                />
              </div>
              <div className="space-y-2">
                <Label>容纳人数</Label>
                <Input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full bg-[#FF6B35] hover:bg-[#e55a2b]">
                {editTable ? '保存修改' : '添加'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-bold text-lg text-slate-800">{table.table_no}</span>
                </div>
                <Badge variant="outline" className={statusMap[table.status]?.color || ''}>
                  {statusMap[table.status]?.label || table.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
                <Users className="w-3.5 h-3.5" />
                <span>{table.capacity} 人</span>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B35]"
                  onClick={() => openEdit(table)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                {table.qrcode_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B35]"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Armchair className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>暂无桌台，点击添加</p>
        </div>
      )}
    </div>
  );
}
