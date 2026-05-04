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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
// import { Switch } from '../../components/ui/switch';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import {
  Plus,
  Ticket,
  Pencil,
  Trash2,
  Percent,
  DollarSign,
} from 'lucide-react';
import type { Coupon } from '../types';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    title: '',
    type: 'amount' as 'amount' | 'discount',
    min_amount: 0,
    discount: 0,
    count: 100,
    start_date: '',
    end_date: '',
    status: 'active' as 'active' | 'inactive',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.getCoupons();
      setCoupons(res.coupons || []);
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
      const data = { ...form, store_id: 1 };
      if (editItem) {
        // update
      } else {
        await apiClient.createCoupon(data);
      }
      setOpen(false);
      setEditItem(null);
      setForm({
        title: '',
        type: 'amount',
        min_amount: 0,
        discount: 0,
        count: 100,
        start_date: '',
        end_date: '',
        status: 'active',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    // Toggle via API not directly available, would need update endpoint
  };

  if (loading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">共 {coupons.length} 张优惠券</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#FF6B35] hover:bg-[#e55a2b]"
              onClick={() => {
                setEditItem(null);
                setForm({
                  title: '',
                  type: 'amount',
                  min_amount: 0,
                  discount: 0,
                  count: 100,
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: '',
                  status: 'active',
                });
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> 添加优惠券
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editItem ? '编辑优惠券' : '添加优惠券'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>标题</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="如：满100减20" />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={form.type === 'amount' ? 'default' : 'outline'}
                    size="sm"
                    className={form.type === 'amount' ? 'bg-[#FF6B35]' : ''}
                    onClick={() => setForm({ ...form, type: 'amount' })}
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1" /> 满减券
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === 'discount' ? 'default' : 'outline'}
                    size="sm"
                    className={form.type === 'discount' ? 'bg-[#FF6B35]' : ''}
                    onClick={() => setForm({ ...form, type: 'discount' })}
                  >
                    <Percent className="w-3.5 h-3.5 mr-1" /> 折扣券
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>最低消费（元）</Label>
                  <Input type="number" value={form.min_amount} onChange={(e) => setForm({ ...form, min_amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>{form.type === 'amount' ? '减免金额（元）' : '折扣（折）'}</Label>
                  <Input type="number" step="0.1" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>发放数量</Label>
                <Input type="number" value={form.count} onChange={(e) => setForm({ ...form, count: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始日期</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>结束日期</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
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
              <TableHead>标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>使用条件</TableHead>
              <TableHead>优惠</TableHead>
              <TableHead>数量</TableHead>
              <TableHead>有效期</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id} className="hover:bg-slate-50/60">
                <TableCell className="font-medium">{coupon.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {coupon.type === 'amount' ? '满减' : '折扣'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-600">满¥{coupon.min_amount}</TableCell>
                <TableCell className="font-medium text-[#FF6B35]">
                  {coupon.type === 'amount' ? `¥${coupon.discount}` : `${coupon.discount}折`}
                </TableCell>
                <TableCell className="text-sm text-slate-600">
                  {coupon.remaining}/{coupon.count}
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {coupon.start_date} ~ {coupon.end_date}
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    coupon.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {coupon.status === 'active' ? '生效中' : '已停用'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B35]">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {coupons.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <Ticket className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>暂无优惠券</p>
        </div>
      )}
    </div>
  );
}
