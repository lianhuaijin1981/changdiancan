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
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Plus,
  Pencil,
  Search,
  UtensilsCrossed,
  X,
  Star,
} from 'lucide-react';
import type { Dish, Category, DishSpec, DishSpecOption } from '../types';

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Dish | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    image: '',
    category_id: 0,
    stock: 99,
    is_featured: false,
    status: 'on' as 'on' | 'off',
    tags: '',
    specs: [] as DishSpec[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { store_id: '1' };
      if (filterCat) params.category_id = filterCat;
      if (filterStatus) params.status = filterStatus;
      if (search) params.keyword = search;
      const [dishRes, catRes]: [any, any] = await Promise.all([
        apiClient.getDishes(1, params),
        apiClient.getCategories(1),
      ]);
      setDishes(dishRes.dishes || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterCat, filterStatus]);

  const handleSearch = () => {
    fetchData();
  };

  const resetForm = () => ({
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    image: '',
    category_id: categories[0]?.id || 0,
    stock: 99,
    is_featured: false,
    status: 'on' as 'on' | 'off',
    tags: '',
    specs: [] as DishSpec[],
  });

  const openEdit = (dish: Dish) => {
    setEditItem(dish);
    setForm({
      name: dish.name,
      description: dish.description || '',
      price: dish.price,
      original_price: dish.original_price || 0,
      image: dish.image || '',
      category_id: dish.category_id,
      stock: dish.stock,
      is_featured: dish.is_featured,
      status: dish.status,
      tags: dish.tags?.join(',') || '',
      specs: dish.specs || [],
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...form,
        store_id: 1,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        await apiClient.updateDish(editItem.id, data);
      } else {
        await apiClient.createDish(data);
      }
      setOpen(false);
      setEditItem(null);
      setForm(resetForm());
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (dish: Dish) => {
    try {
      await apiClient.updateDish(dish.id, {
        status: dish.status === 'on' ? 'off' : 'on',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addSpec = () => {
    setForm((prev) => ({
      ...prev,
      specs: [...prev.specs, { name: '', options: [{ name: '', price: 0 }] }],
    }));
  };

  const removeSpec = (specIdx: number) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== specIdx),
    }));
  };

  const updateSpecName = (specIdx: number, name: string) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) => (i === specIdx ? { ...s, name } : s)),
    }));
  };

  const addSpecOption = (specIdx: number) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) =>
        i === specIdx ? { ...s, options: [...s.options, { name: '', price: 0 }] } : s
      ),
    }));
  };

  const removeSpecOption = (specIdx: number, optIdx: number) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) =>
        i === specIdx ? { ...s, options: s.options.filter((_, j) => j !== optIdx) } : s
      ),
    }));
  };

  const updateSpecOption = (specIdx: number, optIdx: number, field: keyof DishSpecOption, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) =>
        i === specIdx
          ? {
              ...s,
              options: s.options.map((o, j) => (j === optIdx ? { ...o, [field]: value } : o)),
            }
          : s
      ),
    }));
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="搜索菜品名称"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="全部分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部分类</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="全部状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">全部状态</SelectItem>
            <SelectItem value="on">上架</SelectItem>
            <SelectItem value="off">下架</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#FF6B35] hover:bg-[#e55a2b] ml-auto"
              onClick={() => {
                setEditItem(null);
                setForm(resetForm());
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> 添加菜品
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editItem ? '编辑菜品' : '添加菜品'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>菜品名称 *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select value={String(form.category_id)} onValueChange={(v) => setForm({ ...form, category_id: Number(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>售价 *</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>原价</Label>
                  <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>库存</Label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>图片URL</Label>
                <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>标签（逗号分隔）</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="如：招牌,辣,热销" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })} />
                  <Label>推荐菜品</Label>
                </div>
              </div>

              {/* Specs Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>规格选项</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                    <Plus className="w-3 h-3 mr-1" /> 添加规格
                  </Button>
                </div>
                {form.specs.map((spec, specIdx) => (
                  <div key={specIdx} className="border rounded-lg p-3 space-y-2 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="规格名称，如：辣度"
                        value={spec.name}
                        onChange={(e) => updateSpecName(specIdx, e.target.value)}
                        className="flex-1 h-8 text-sm"
                      />
                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400" onClick={() => removeSpec(specIdx)}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {spec.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2 ml-4">
                        <Input
                          placeholder="选项名"
                          value={opt.name}
                          onChange={(e) => updateSpecOption(specIdx, optIdx, 'name', e.target.value)}
                          className="flex-1 h-8 text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="加价"
                          value={opt.price}
                          onChange={(e) => updateSpecOption(specIdx, optIdx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                        />
                        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400" onClick={() => removeSpecOption(specIdx, optIdx)}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" className="ml-4 h-7 text-xs" onClick={() => addSpecOption(specIdx)}>
                      <Plus className="w-3 h-3 mr-1" /> 添加选项
                    </Button>
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmit} className="w-full bg-[#FF6B35] hover:bg-[#e55a2b]">
                {editItem ? '保存修改' : '添加菜品'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dish List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">图片</TableHead>
              <TableHead>菜品名称</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>库存</TableHead>
              <TableHead>销量</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}><Skeleton className="h-10" /></TableCell>
                </TableRow>
              ))
            ) : (
              dishes.map((dish) => (
                <TableRow key={dish.id} className="hover:bg-slate-50/60">
                  <TableCell>
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-800">{dish.name}</span>
                      {dish.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                    {dish.tags && dish.tags.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {dish.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] h-4 px-1">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">{dish.category_name || '-'}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-[#FF6B35]">¥{dish.price.toFixed(2)}</span>
                    {dish.original_price ? (
                      <span className="text-slate-400 line-through text-sm ml-1">¥{dish.original_price.toFixed(2)}</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-slate-600">{dish.stock}</TableCell>
                  <TableCell className="text-slate-600">{dish.sales}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleStatus(dish)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                        dish.status === 'on'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {dish.status === 'on' ? '上架' : '下架'}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-[#FF6B35]" onClick={() => openEdit(dish)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && dishes.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>暂无菜品</p>
        </div>
      )}
    </div>
  );
}
