import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { PlatformDashboard, RevenueTrendData, TopStore, TemplateDistributionItem } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Store,
  ClipboardList,
  DollarSign,
  Users,
  TrendingUp,
  Crown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

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

export default function Dashboard() {
  const [stats, setStats] = useState<PlatformDashboard | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);
  const [topStores, setTopStores] = useState<TopStore[]>([]);
  const [templateData, setTemplateData] = useState<TemplateDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, trend, top, tpl] = await Promise.all([
          apiClient.getDashboard(),
          apiClient.getRevenueTrend(30),
          apiClient.getTopStores(),
          apiClient.getTemplateDistribution(),
        ]);
        setStats(dash);
        setRevenueTrend(trend.data);
        setTopStores(top.stores.slice(0, 10));
        setTemplateData(tpl.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    {
      label: '商家总数',
      value: stats?.total_stores ?? 0,
      icon: Store,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: '今日订单',
      value: stats?.today_orders ?? 0,
      icon: ClipboardList,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: '今日营收',
      value: stats ? formatCurrency(stats.today_revenue) : '---',
      icon: DollarSign,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: '平台总用户',
      value: stats?.total_users ?? 0,
      icon: Users,
      color: 'text-violet-500',
      bg: 'bg-violet-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              <CardTitle className="text-base font-semibold text-slate-800">营收趋势（近30天）</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    labelFormatter={(label) => label}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF6B35"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Template Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FF6B35]" />
              <CardTitle className="text-base font-semibold text-slate-800">模板分布</CardTitle>
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
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="template"
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
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {templateData.map((item, idx) => (
                <div key={item.template} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-slate-600">{item.template}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Stores Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#FF6B35]" />
            <CardTitle className="text-base font-semibold text-slate-800">营收排行榜（Top 10）</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-16">排名</TableHead>
                  <TableHead>商家名称</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>模板</TableHead>
                  <TableHead className="text-right">订单数</TableHead>
                  <TableHead className="text-right">营收</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStores.map((store, idx) => (
                  <TableRow key={store.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx < 3
                            ? 'bg-[#FF6B35] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{store.name}</TableCell>
                    <TableCell className="text-slate-500">{store.phone}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {store.template}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{store.order_count}</TableCell>
                    <TableCell className="text-right font-semibold text-[#FF6B35]">
                      {formatCurrency(store.revenue)}
                    </TableCell>
                  </TableRow>
                ))}
                {topStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
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
  );
}
