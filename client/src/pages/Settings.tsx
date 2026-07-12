/**
 * Campamento Gecko - Settings Page
 */
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Wifi, WifiOff, Trash2, ChevronLeft, User, Shield } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

export default function Settings() {
  const { getDays, saveDays } = useOfflineStorage();
  const { requestNotificationPermission, checkAndSendNotifications } = useNotificationManager();
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swStatus, setSwStatus] = useState<string>('Verificando...');
  const [cacheSize, setCacheSize] = useState<string>('0 MB');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        setSwStatus(regs.length > 0 ? '✅ Ativo' : '⚠️ Não registado');
      }).catch(() => setSwStatus('❌ Erro'));
    } else {
      setSwStatus('❌ Não suportado');
    }

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(est => {
        setCacheSize(`${((est.usage || 0) / 1024 / 1024).toFixed(2)} MB`);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClearData = async () => {
    if (!confirm('Apagar todos os dados locais?')) return;
    await saveDays([]);
    toast.success('Dados apagados');
    window.location.reload();
  };

  const ROLE_LABELS: Record<string, string> = {
    director: '🎯 Director',
    monitor: '👥 Monitor',
    admin: '🛡️ Admin',
  };

  return (
    <div className="min-h-screen bg-gecko-bg pb-8">
      <header className="sticky top-0 z-40 border-b border-gecko-border bg-gecko-bg/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation('/')} className="rounded-full p-2 hover:bg-gecko-card transition-colors">
            <ChevronLeft className="h-5 w-5 text-gecko-muted" />
          </button>
          <h1 className="text-xl font-bold text-gecko-green font-playfair">Configurações</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* User Profile */}
        <Card className="gecko-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gecko-green/20 border-2 border-gecko-green flex items-center justify-center">
              <span className="text-2xl">🦎</span>
            </div>
            <div>
              <p className="font-bold text-gecko-text">{user?.nome ?? 'Utilizador'}</p>
              <p className="text-sm text-gecko-muted">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gecko-green/20 text-gecko-green border border-gecko-green/30 mt-1 inline-block">
                {user?.role ? ROLE_LABELS[user.role] : 'Monitor'}
              </span>
            </div>
          </div>
          <Button onClick={signOut} variant="outline" className="w-full mt-4 border-gecko-border text-gecko-muted hover:text-red-400 hover:border-red-400">
            Terminar Sessão
          </Button>
        </Card>

        {/* Status */}
        <Card className="gecko-card p-5">
          <h2 className="font-bold text-gecko-text mb-4 flex items-center gap-2">
            <Wifi className="h-4 w-4 text-gecko-green" /> Estado da Aplicação
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gecko-bg rounded-lg">
              <div className="flex items-center gap-2">
                {isOnline ? <Wifi className="h-4 w-4 text-gecko-green" /> : <WifiOff className="h-4 w-4 text-red-400" />}
                <span className="text-sm text-gecko-text">Conexão</span>
              </div>
              <span className={`text-sm font-medium ${isOnline ? 'text-gecko-green' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gecko-bg rounded-lg">
              <span className="text-sm text-gecko-text">Service Worker</span>
              <span className="text-xs text-gecko-muted">{swStatus}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gecko-bg rounded-lg">
              <span className="text-sm text-gecko-text">Cache</span>
              <span className="text-xs text-gecko-muted">{cacheSize}</span>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="gecko-card p-5">
          <h2 className="font-bold text-gecko-text mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-gecko-amber" /> Notificações
          </h2>
          <p className="text-sm text-gecko-muted mb-4">Alertas 10 minutos antes de cada atividade</p>
          <div className="flex gap-2">
            <Button onClick={async () => {
              const ok = await requestNotificationPermission();
              toast[ok ? 'success' : 'error'](ok ? 'Notificações ativadas!' : 'Permissão recusada');
            }} className="flex-1 bg-gecko-green text-gecko-bg hover:bg-gecko-green/90">
              Ativar
            </Button>
            <Button onClick={async () => { await checkAndSendNotifications(); toast.info('Verificação concluída'); }}
              variant="outline" className="flex-1 border-gecko-border text-gecko-text">
              Testar
            </Button>
          </div>
        </Card>

        {/* Storage */}
        <Card className="gecko-card p-5">
          <h2 className="font-bold text-gecko-text mb-4">Armazenamento</h2>
          <Button onClick={handleClearData} variant="destructive" className="w-full">
            <Trash2 className="mr-2 h-4 w-4" /> Apagar Dados Locais
          </Button>
          <p className="text-xs text-gecko-muted mt-2 text-center">⚠️ Esta ação é irreversível</p>
        </Card>

        {/* About */}
        <Card className="gecko-card p-5">
          <div className="text-center">
            <span className="text-4xl block mb-2">🦎</span>
            <p className="font-bold text-gecko-green font-playfair">Campamento Gecko</p>
            <p className="text-xs text-gecko-muted mt-1">v2.0.0 • React 19 + Supabase</p>
            <div className="mt-3 text-xs text-gecko-muted space-y-1">
              <p>✅ Funciona offline</p>
              <p>✅ Notificações automáticas</p>
              <p>✅ Roles e permissões</p>
              <p>✅ Biblioteca de atividades</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
