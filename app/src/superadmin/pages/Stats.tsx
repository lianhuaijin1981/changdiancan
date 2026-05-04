import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { RevenueTrendData, TemplateDistributionItem, TopStore } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { BarChart3, TrendingUp, Crown, Loader2 } from 'lucide-react';

const PIE_COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Stats() {
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);
  const [templateData, setTemplateData] = useState<TemplateDistributionItem[]>([]);
  const [topStores, setTopStores] = useState<TopStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [trend, tpl, top] = await Promise.all([
          apiClient.getRevenueTrend(30),
          apiClient.getTemplateDistribution(),
          apiClient.getTopStores(),
        ]);
        setRevenueTrend(trend.data);
        setTemplateData(tpl.data);
        setTopStores(top.stores);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Bar Chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF6B35]" />
            <CardTitle className="text-base font-semibold text-slate-800">营收统计（近30天）</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `¥${v}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), '营收']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="revenue" fill="#FF6B35" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              <CardTitle className="text-base font-semibold text-slate-800">模板使用分布</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={templateData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="count"
                    nameKey="template"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {templateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} 家`, name]}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* All Top Stores */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FF6B35]" />
              <CardTitle className="text-base font-semibold text-slate-800">商家营收排行</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-14">排名</TableHead>
                    <TableHead>商家</TableHead>
                    <TableHead className="text-right">营收</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStores.map((store, idx) => (
                    <TableRow key={store.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx < 3
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-800 truncate max-w-[180px]">
                        {store.name}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-[#FF6B35]">
                        {formatCurrency(store.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {topStores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
