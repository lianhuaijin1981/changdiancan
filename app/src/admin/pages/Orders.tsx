import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Search,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Eye,
  Package,
  ChefHat,
  CheckCircle,
} from 'lucide-react';
import type { Order } from '../types';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: '已接单', color: 'bg-blue-100 text-blue-700' },
  cooking: { label: '制作中', color: 'bg-orange-100 text-orange-700' },
  served: { label: '已上菜', color: 'bg-purple-100 text-purple-700' },
  completed: { label: '已完成', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: '已取消', color: 'bg-slate-100 text-slate-500' },
};

const typeMap: Record<string, string> = {
  dine_in: '堂食',
  takeaway: '自取',
  delivery: '外卖',
};

const statusActions: Record<string, { label: string; next: string; icon: typeof Package }[]> = {
  pending: [{ label: '接单', next: 'confirmed', icon: Package }],
  confirmed: [{ label: '开始制作', next: 'cooking', icon: ChefHat }],
  cooking: [{ label: '制作完成', next: 'served', icon: CheckCircle }],
  served: [{ label: '完成订单', next: 'completed', icon: CheckCircle }],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchOrders = async (p = page) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(p), per_page: String(perPage) };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (search) params.keyword = search;
      const res: any = await apiClient.getOrders(params);
      setOrders(res.orders || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter, typeFilter]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, status);
      fetchOrders(page);
      if (detailOrder && detailOrder.id === orderId) {
        setDetailOrder({ ...detailOrder, status: status as any });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const viewDetail = async (order: Order) => {
    try {
      const res: any = await apiClient.getOrder(order.id);
      setDetailOrder(res.order);
      setDetailOpen(true);
    } catch {
      setDetailOrder(order);
      setDetailOpen(true);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="搜索订单号/手机号"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchOrders(1)}
          />
          <Button variant="outline" size="icon" onClick={() => fetchOrders(1)}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="confirmed">已接单</SelectItem>
            <SelectItem value="cooking">制作中</SelectItem>
            <SelectItem value="served">已上菜</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="全部类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部类型</SelectItem>
            <SelectItem value="dine_in">堂食</SelectItem>
            <SelectItem value="takeaway">自取</SelectItem>
            <SelectItem value="delivery">外卖</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>顾客</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-10" /></TableCell>
                </TableRow>
              ))
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/60">
                  <TableCell className="font-mono text-sm text-slate-600">{order.order_no}</TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">{typeMap[order.type] || order.type}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-slate-700">{order.user_name || '-'}</p>
                      <p className="text-xs text-slate-400">{order.user_phone || ''}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-slate-800">¥{order.pay_amount.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusMap[order.status]?.color || ''}`}>
                      {statusMap[order.status]?.label || order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleString('zh-CN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {statusActions[order.status]?.map((action) => (
                        <Button
                          key={action.next}
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
                          onClick={() => handleStatusUpdate(order.id, action.next)}
                        >
                          <action.icon className="w-3 h-3 mr-1" />
                          {action.label}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B35]" onClick={() => viewDetail(order)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchOrders(page - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetchOrders(page + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>暂无订单</p>
        </div>
      )}

      {/* Order Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              订单详情
              <span className="font-mono text-sm text-slate-400">#{detailOrder?.order_no}</span>
            </DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">订单状态</p>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${statusMap[detailOrder.status]?.color || ''}`}>
                      {statusMap[detailOrder.status]?.label || detailOrder.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">订单类型</p>
                    <p className="text-sm font-medium">{typeMap[detailOrder.type]}</p>
                  </div>
                </div>

                {detailOrder.table_no && (
                  <div>
                    <p className="text-sm text-slate-500">桌台</p>
                    <p className="text-sm font-medium">{detailOrder.table_no} 号桌 {detailOrder.people_count ? `(${detailOrder.people_count}人)` : ''}</p>
                  </div>
                )}

                {detailOrder.address && (
                  <div>
                    <p className="text-sm text-slate-500">配送地址</p>
                    <p className="text-sm">{detailOrder.address}</p>
                  </div>
                )}

                {detailOrder.remark && (
                  <div>
                    <p className="text-sm text-slate-500">备注</p>
                    <p className="text-sm text-amber-600">{detailOrder.remark}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-slate-500 mb-2">订单明细</p>
                  <div className="space-y-2">
                    {(detailOrder.items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50">
                        {item.dish_image ? (
                          <img src={item.dish_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.dish_name}</p>
                          {item.specs && <p className="text-xs text-slate-400">{item.specs}</p>}
                        </div>
                        <span className="text-sm text-slate-500">x{item.quantity}</span>
                        <span className="text-sm font-medium">¥{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <p className="text-sm text-slate-500">总计：¥{detailOrder.total_amount.toFixed(2)}</p>
                  {detailOrder.discount_amount > 0 && (
                    <p className="text-sm text-emerald-600">优惠：-¥{detailOrder.discount_amount.toFixed(2)}</p>
                  )}
                  {detailOrder.delivery_fee ? (
                    <p className="text-sm text-slate-500">配送费：¥{detailOrder.delivery_fee.toFixed(2)}</p>
                  ) : null}
                  <p className="text-base font-bold text-[#FF6B35]">实付：¥{detailOrder.pay_amount.toFixed(2)}</p>
                </div>

                {statusActions[detailOrder.status] && (
                  <div className="flex gap-2 pt-2">
                    {statusActions[detailOrder.status].map((action) => (
                      <Button
                        key={action.next}
                        className="flex-1 bg-[#FF6B35] hover:bg-[#e55a2b]"
                        onClick={() => {
                          handleStatusUpdate(detailOrder.id, action.next);
                          setDetailOpen(false);
                        }}
                      >
                        <action.icon className="w-4 h-4 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
