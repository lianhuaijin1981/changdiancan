import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Skeleton } from '../../components/ui/skeleton';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import {
  Store as StoreIcon,
  Save,
  Loader2,
  MapPin,
  Phone,
  Clock,
  Megaphone,
  Bike,
  DollarSign,
} from 'lucide-react';
import type { Store as StoreType } from '../types';

export default function StorePage() {
  const [store, setStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiClient
      .getStores()
      .then((res: any) => {
        if (res.stores && res.stores.length > 0) {
          setStore(res.stores[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    setMessage('');
    try {
      await apiClient.updateStore(store.id, store);
      setMessage('保存成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!store) return;
    try {
      const res: any = await apiClient.toggleStoreStatus(store.id);
      setStore(res.store);
    } catch (err) {
      console.error(err);
    }
  };

  const updateField = (field: keyof StoreType, value: any) => {
    setStore((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-20 text-slate-500">
        <StoreIcon className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>暂无店铺信息</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
            <StoreIcon className="w-5 h-5 text-[#FF6B35]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{store.name}</h2>
            <Badge
              variant={store.status === 'open' ? 'default' : 'secondary'}
              className={
                store.status === 'open'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-100'
              }
            >
              {store.status === 'open' ? '营业中' : '休息中'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={store.status === 'open'}
              onCheckedChange={handleToggleStatus}
            />
            <span className="text-sm text-slate-600">
              {store.status === 'open' ? '营业' : '休息'}
            </span>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#FF6B35] hover:bg-[#e55a2b]"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            保存
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.includes('成功') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      {/* Basic Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <StoreIcon className="w-3.5 h-3.5" /> 店铺名称
            </Label>
            <Input value={store.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <Phone className="w-3.5 h-3.5" /> 联系电话
            </Label>
            <Input value={store.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5" /> 店铺地址
            </Label>
            <Input value={store.address || ''} onChange={(e) => updateField('address', e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <StoreIcon className="w-3.5 h-3.5" /> 店铺简介
            </Label>
            <Textarea
              value={store.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">营业设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5" /> 营业时间
              </Label>
              <Input
                value={store.business_hours || ''}
                onChange={(e) => updateField('business_hours', e.target.value)}
                placeholder="如：09:00-22:00"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-slate-600">
                <Megaphone className="w-3.5 h-3.5" /> 店铺公告
              </Label>
              <Input
                value={store.notice || ''}
                onChange={(e) => updateField('notice', e.target.value)}
                placeholder="输入店铺公告"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-700">配送设置</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <Bike className="w-3.5 h-3.5" /> 配送费（元）
            </Label>
            <Input
              type="number"
              value={store.delivery_fee || 0}
              onChange={(e) => updateField('delivery_fee', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <DollarSign className="w-3.5 h-3.5" /> 起送金额（元）
            </Label>
            <Input
              type="number"
              value={store.min_order_amount || 0}
              onChange={(e) => updateField('min_order_amount', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5" /> 配送范围（km）
            </Label>
            <Input
              type="number"
              value={store.delivery_range || 0}
              onChange={(e) => updateField('delivery_range', parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
