/**
 * Campamento Gecko - Login Page
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1a0a] via-[#1a2e10] to-[#0d1f08] p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #4ade80 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gecko-green/20 border-2 border-gecko-green mb-4">
            <span className="text-4xl">🦎</span>
          </div>
          <h1 className="text-4xl font-bold text-gecko-green font-playfair">Campamento Gecko</h1>
          <p className="text-gecko-muted mt-2">Gestão de acampamentos</p>
        </div>

        <Card className="bg-gecko-card border-gecko-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gecko-text mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="director@campamentogecko.com"
                className="bg-gecko-bg border-gecko-border text-gecko-text placeholder:text-gecko-muted"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gecko-text mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-gecko-bg border-gecko-border text-gecko-text placeholder:text-gecko-muted"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gecko-green hover:bg-gecko-green/90 text-white font-semibold py-3"
            >
              {isLoading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gecko-green/10 border border-gecko-green/30 rounded-lg">
            <p className="text-xs text-gecko-muted text-center">
              💡 <strong className="text-gecko-green">Modo Demo:</strong> Use qualquer email com "gecko" ou "demo@campamentogecko.com"
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
