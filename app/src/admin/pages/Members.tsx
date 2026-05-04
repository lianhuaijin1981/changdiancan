import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import {
  Users,
  TrendingUp,
  Award,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { Member, MemberLevel, MemberStatsData } from '../types';

const COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [levels, setLevels] = useState<MemberLevel[]>([]);
  const [stats, setStats] = useState<MemberStatsData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [memRes, lvlRes, statRes]: [any, any, any] = await Promise.all([
        apiClient.getMembers(),
        apiClient.getMemberLevels(),
        apiClient.getMemberStats(),
      ]);
      setMembers(memRes.members || []);
      setLevels(lvlRes.levels || []);
      setStats(statRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalConsumption = members.reduce((sum, m) => sum + m.total_consumption, 0);
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">会员总数</p>
                <p className="text-2xl font-bold text-slate-800">{members.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#FF6B35]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">累计消费</p>
                <p className="text-2xl font-bold text-slate-800">¥{totalConsumption.toFixed(2)}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">积分总数</p>
                <p className="text-2xl font-bold text-slate-800">{totalPoints}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Level Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">会员等级分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="level_name"
                >
                  {stats.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}人`, '人数']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Rules */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">会员等级规则</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {levels.map((level, i) => (
                <div key={level.id} className="border rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    >
                      {level.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-800">{level.name}</span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-500">
                    <p>最低积分：{level.min_points}</p>
                    <p>折扣：{level.discount}折</p>
                    <p>人数：{level.member_count || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">会员列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>会员</TableHead>
                  <TableHead>等级</TableHead>
                  <TableHead>积分</TableHead>
                  <TableHead>余额</TableHead>
                  <TableHead>消费金额</TableHead>
                  <TableHead>订单数</TableHead>
                  <TableHead>注册时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id} className="hover:bg-slate-50/60">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8F5A] flex items-center justify-center text-white font-bold text-sm">
                          {member.nickname?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{member.nickname || '-'}</p>
                          <p className="text-xs text-slate-400">{member.phone || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {member.level_name || '普通'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{member.points}</TableCell>
                    <TableCell className="text-slate-600">¥{member.balance.toFixed(2)}</TableCell>
                    <TableCell className="font-medium text-[#FF6B35]">¥{member.total_consumption.toFixed(2)}</TableCell>
                    <TableCell className="text-slate-600">{member.order_count}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(member.created_at).toLocaleDateString('zh-CN')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {members.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>暂无会员</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
