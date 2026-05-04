import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAdmin } from '../context/AdminContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Palette, Loader2 } from 'lucide-react';

export default function Login() {
  const { login, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phone || !password) {
      setError('请输入手机号和密码');
      return;
    }
    setIsLoading(true);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#FF6B35] flex items-center justify-center shadow-lg shadow-orange-200">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">畅点餐</h1>
            <p className="text-slate-500 text-sm">平台超级管理后台</p>
          </div>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg font-semibold text-slate-700">
              超级管理员登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 bg-red-50 p-2.5 rounded-lg">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full h-11 bg-[#FF6B35] hover:bg-[#e55a2b] text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
