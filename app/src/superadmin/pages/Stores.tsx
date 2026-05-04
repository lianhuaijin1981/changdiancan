import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { PlatformStore } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  Loader2,
} from 'lucide-react';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value);
}

export default function Stores() {
  const [stores, setStores] = useState<PlatformStore[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadStores = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        per_page: String(perPage),
      };
      if (search.trim()) {
        params.search = search.trim();
      }
      const res = await apiClient.getStores(params);
      setStores(res.stores);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, search]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadStores();
  };

  const handleToggleStatus = async (store: PlatformStore) => {
    const newStatus = store.status === 'enabled' ? 'disabled' : 'enabled';
    setUpdatingId(store.id);
    try {
      await apiClient.updateStoreStatus(store.id, newStatus);
      setStores((prev) =>
        prev.map((s) => (s.id === store.id ? { ...s, status: newStatus } : s))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-[#FF6B35]" />
              <CardTitle className="text-base font-semibold text-slate-800">商家管理</CardTitle>
            </div>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                placeholder="搜索商家名称或手机号"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 h-9"
              />
              <Button type="submit" variant="outline" size="sm" className="h-9 px-3">
                <Search className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead>商家名称</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>模板</TableHead>
                  <TableHead className="text-right">订单数</TableHead>
                  <TableHead className="text-right">营收</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400" />
                    </TableCell>
                  </TableRow>
                ) : stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                      暂无商家数据
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-800">{store.name}</TableCell>
                      <TableCell className="text-slate-500">{store.phone}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            store.status === 'enabled'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {store.status === 'enabled' ? '正常营业' : '已停用'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {store.template}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{store.order_count}</TableCell>
                      <TableCell className="text-right font-semibold text-[#FF6B35]">
                        {formatCurrency(store.revenue)}
                      </TableCell>
                      <TableCell className="text-slate-500">{formatDate(store.created_at)}</TableCell>
                      <TableCell className="text-center">
                        {updatingId === store.id ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto text-slate-400" />
                        ) : (
                          <Switch
                            checked={store.status === 'enabled'}
                            onCheckedChange={() => handleToggleStatus(store)}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-slate-500">
                共 <span className="font-medium text-slate-700">{total}</span> 条记录，
                第 <span className="font-medium text-slate-700">{page}</span> / {totalPages} 页
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 p-0 ${
                      p === page ? 'bg-[#FF6B35] hover:bg-[#e55a2b] text-white' : ''
                    }`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
