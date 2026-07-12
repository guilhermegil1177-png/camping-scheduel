/**
 * Campamento Gecko - Dashboard Home
 * Personalized welcome, quick shortcuts, recent schedules overview
 */
import { useEffect, useState } from 'react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useAuth } from '@/contexts/AuthContext';
import { initializeSampleData } from '@/lib/sampleData';
import TimeSlotCard from '@/components/TimeSlotCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft, ChevronRight, Plus, Bell, Settings, Upload,
  Calendar, BookOpen, BarChart2, LogOut, CheckCircle2, Clock, Users
} from 'lucide-react';
import { useLocation } from 'wouter';
import type { CampDay, TimeSlot } from '@/types';

export default function Home() {
  const { getDays, saveDays, saveDay } = useOfflineStorage();
  const { scheduleNotificationsForDay } = useNotificationManager();
  const { user, signOut, isDirector } = useAuth();
  const [, setLocation] = useLocation();

  const [days, setDays] = useState<CampDay[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'timeline'>('dashboard');

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDays = await getDays();
        if (savedDays.length === 0) {
          const sampleDays = initializeSampleData();
          await saveDays(sampleDays);
          setDays(sampleDays);
          for (const day of sampleDays) {
            await scheduleNotificationsForDay(day);
          }
        } else {
          setDays(savedDays);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const currentDay = days[currentDayIndex];
  const completedCount = currentDay?.timeSlots.filter(s => s.completed).length ?? 0;
  const totalCount = currentDay?.timeSlots.length ?? 0;
  const pendingCount = totalCount - completedCount;

  const handleToggleComplete = async (slotId: string) => {
    if (!currentDay) return;
    const updatedDay = {
      ...currentDay,
      timeSlots: currentDay.timeSlots.map(slot =>
        slot.id === slotId ? { ...slot, completed: !slot.completed } : slot
      ),
      updatedAt: Date.now(),
    };
    await saveDay(updatedDay);
    setDays(days.map(d => d.id === currentDay.id ? updatedDay : d));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gecko-bg">
        <div className="text-center">
          <span className="text-6xl animate-bounce block mb-4">🦎</span>
          <p className="text-gecko-green font-semibold text-lg">A carregar...</p>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="min-h-screen bg-gecko-bg pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gecko-border bg-gecko-bg/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🦎</span>
              <div>
                <h1 className="text-xl font-bold text-gecko-green font-playfair leading-none">
                  Campamento Gecko
                </h1>
                <p className="text-xs text-gecko-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLocation('/settings')}
                className="rounded-full p-2 hover:bg-gecko-card transition-colors"
              >
                <Settings className="h-5 w-5 text-gecko-muted" />
              </button>
              <button
                onClick={() => signOut()}
                className="rounded-full p-2 hover:bg-gecko-card transition-colors"
              >
                <LogOut className="h-5 w-5 text-gecko-muted" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gecko-text font-playfair">
            {greeting}, {user?.nome?.split(' ')[0] ?? 'Monitor'} 👋
          </h2>
          <p className="text-gecko-muted text-sm mt-1">
            {new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Stats Cards */}
        {currentDay && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="gecko-card p-4 text-center">
              <CheckCircle2 className="h-6 w-6 text-gecko-green mx-auto mb-1" />
              <p className="text-2xl font-bold text-gecko-green">{completedCount}</p>
              <p className="text-xs text-gecko-muted">Concluídas</p>
            </Card>
            <Card className="gecko-card p-4 text-center">
              <Clock className="h-6 w-6 text-gecko-amber mx-auto mb-1" />
              <p className="text-2xl font-bold text-gecko-amber">{pendingCount}</p>
              <p className="text-xs text-gecko-muted">Pendentes</p>
            </Card>
            <Card className="gecko-card p-4 text-center">
              <Users className="h-6 w-6 text-gecko-blue mx-auto mb-1" />
              <p className="text-2xl font-bold text-gecko-blue">{days.length}</p>
              <p className="text-xs text-gecko-muted">Dias</p>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-gecko-muted uppercase tracking-wider mb-3">Atalhos</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLocation('/schedules')}
              className="gecko-card p-4 flex items-center gap-3 text-left hover:border-gecko-green transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gecko-green/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gecko-green" />
              </div>
              <div>
                <p className="font-semibold text-gecko-text text-sm">Cronogramas</p>
                <p className="text-xs text-gecko-muted">Ver e gerir</p>
              </div>
            </button>
            <button
              onClick={() => setLocation('/activities')}
              className="gecko-card p-4 flex items-center gap-3 text-left hover:border-gecko-green transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-gecko-blue/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-gecko-blue" />
              </div>
              <div>
                <p className="font-semibold text-gecko-text text-sm">Atividades</p>
                <p className="text-xs text-gecko-muted">Biblioteca</p>
              </div>
            </button>
            {isDirector() && (
              <button
                onClick={() => setLocation('/import')}
                className="gecko-card p-4 flex items-center gap-3 text-left hover:border-gecko-green transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gecko-amber/20 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-gecko-amber" />
                </div>
                <div>
                  <p className="font-semibold text-gecko-text text-sm">Importar Dia</p>
                  <p className="text-xs text-gecko-muted">Colar esquema</p>
                </div>
              </button>
            )}
            <button
              onClick={() => setView(view === 'dashboard' ? 'timeline' : 'dashboard')}
              className="gecko-card p-4 flex items-center gap-3 text-left hover:border-gecko-green transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gecko-text text-sm">
                  {view === 'dashboard' ? 'Ver Timeline' : 'Ver Dashboard'}
                </p>
                <p className="text-xs text-gecko-muted">Hoje</p>
              </div>
            </button>
          </div>
        </div>

        {/* Today's Timeline */}
        {view === 'timeline' && currentDay && (
          <div>
            {/* Day Navigation */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentDayIndex(i => Math.max(0, i - 1))}
                className="border-gecko-border text-gecko-text hover:bg-gecko-card">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <h3 className="font-bold text-gecko-green">{currentDay.title}</h3>
                <p className="text-xs text-gecko-muted">{completedCount}/{totalCount} concluído</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentDayIndex(i => Math.min(days.length - 1, i + 1))}
                className="border-gecko-border text-gecko-text hover:bg-gecko-card">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress */}
            <div className="h-2 w-full rounded-full bg-gecko-card overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-gecko-green to-gecko-blue transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>

            {/* Slots */}
            <div className="space-y-2">
              {currentDay.timeSlots.map((slot, index) => (
                <div key={slot.id} className="animate-in" style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}>
                  <TimeSlotCard slot={slot} onToggleComplete={handleToggleComplete} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Schedules preview */}
        {view === 'dashboard' && days.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gecko-muted uppercase tracking-wider">Dias Recentes</h3>
              <button onClick={() => setLocation('/schedules')} className="text-xs text-gecko-green hover:underline">
                Ver todos
              </button>
            </div>
            <div className="space-y-2">
              {days.slice(0, 3).map(day => {
                const done = day.timeSlots.filter(s => s.completed).length;
                const total = day.timeSlots.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Card key={day.id} className="gecko-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gecko-text text-sm">{day.title}</p>
                      <span className="text-xs text-gecko-muted">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gecko-bg overflow-hidden">
                      <div
                        className="h-full bg-gecko-green transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gecko-muted mt-1">{done}/{total} atividades</p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="container mx-auto px-4 py-6 text-center text-xs text-gecko-muted">
        🦎 Campamento Gecko • Funciona offline • Notificações 10 min antes
      </footer>
    </div>
  );
}
