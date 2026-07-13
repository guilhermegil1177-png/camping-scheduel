import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, MessageCircle, CheckCircle2, ChevronDown, Users, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Chat from '@/components/Chat';
import NotificationsPanel from '@/components/NotificationsPanel';

interface ActivitySlot {
  id: string;
  time: string;
  title: string;
  description: string;
  assignees: string[];
  notes: string[];
  completed: boolean;
}

interface DaySchedule {
  id: string;
  title: string;
  date: string;
  activities: ActivitySlot[];
}

const DEMO_SCHEDULE: DaySchedule = {
  id: '1',
  title: 'Día 6 - PILONES',
  date: new Date().toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' }),
  activities: [
    { id: 'a1', time: '07:50', title: 'Despertador', description: 'Acordar os acampados e garantir que todos se levantam a tempo.', assignees: ['Maria Monitor', 'Pedro Monitor'], notes: ['Bater às portas dos quartos 1 a 6'], completed: false },
    { id: 'a2', time: '08:20', title: 'Desayuno', description: 'Pequeno-almoço coletivo no refeitório. Aron, Gil e Sergio ficam na instalação.', assignees: ['Sofia Monitor'], notes: ['Aron, Gil e Sergio ficam na instalação'], completed: false },
    { id: 'a3', time: '09:30', title: 'Partida para Pilones', description: 'Saída de autocarro para a descida de Pilones em Jerte. Briefing de segurança antes de entrar na água.', assignees: ['Maria Monitor', 'João Director'], notes: ['Verificar lista de presença', 'Levar kit de primeiros socorros'], completed: false },
    { id: 'a4', time: '13:00', title: 'Picnic na Montanha', description: 'Almoço ao ar livre com vista panorâmica. Distribuição de marmitas.', assignees: ['Pedro Monitor', 'Sofia Monitor'], notes: ['Vegetarianos: Aron e Lena'], completed: false },
    { id: 'a5', time: '17:00', title: 'Regresso ao Campo', description: 'Retorno de autocarro. Contagem de todos os acampados antes de partir.', assignees: ['Maria Monitor'], notes: [], completed: false },
    { id: 'a6', time: '19:30', title: 'Jantar', description: 'Jantar coletivo. Menu especial pós-actividade.', assignees: ['Sofia Monitor', 'Pedro Monitor'], notes: [], completed: false },
  ],
};

export default function MonitorDashboard() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<DaySchedule>(DEMO_SCHEDULE);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadNotifs = 2;

  const toggleExpand = (id: string) => setExpanded(prev => prev === id ? null : id);

  const isAssignedTo = (act: ActivitySlot) => {
    if (act.assignees.length === 0) return true;
    const userName = (user?.name || user?.email || '').toLowerCase();
    return act.assignees.some(a => a.toLowerCase() === userName);
  };

  const toggleComplete = (act: ActivitySlot) => {
    if (!isAssignedTo(act)) {
      toast.error('Só podes marcar atividades às quais estás atribuído.');
      return;
    }
    setSchedule(prev => ({
      ...prev,
      activities: prev.activities.map(a =>
        a.id === act.id ? { ...a, completed: !a.completed } : a
      ),
    }));
  };

  const done = schedule.activities.filter(a => a.completed).length;
  const total = schedule.activities.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const firstName = user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Monitor';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="text-2xl">🦎</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm leading-tight">Campamento Gecko</p>
            <p className="text-xs text-muted-foreground">Olá, {firstName} 👋</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setShowChat(true); setShowNotifs(false); }}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button
              onClick={() => { setShowNotifs(prev => !prev); setShowChat(false); }}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {showNotifs && (
        <NotificationsPanel onClose={() => setShowNotifs(false)} />
      )}

      <div className="container mx-auto px-4 py-4 max-w-lg pb-24">
        {/* Schedule Header */}
        <div className="gecko-card mb-4 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📋</span>
            <h1 className="font-bold text-foreground text-base">{schedule.title}</h1>
          </div>
          <p className="text-xs text-muted-foreground mb-3 capitalize">{schedule.date}</p>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{done}/{total} concluídas</span>
            <span className="text-primary font-semibold">{pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: pct + '%' }}
            />
          </div>
        </div>

        {/* Activity Cards */}
        <div className="flex flex-col gap-3">
          {schedule.activities.map((act, i) => {
            const isOpen = expanded === act.id;
            const canComplete = isAssignedTo(act);
            return (
              <div
                key={act.id}
                className={`rounded-xl border overflow-hidden transition-all duration-200 animate-slide-up ${
                  act.completed ? 'border-primary/30 bg-card/60' : 'border-border bg-card'
                }`}
                style={{ animationDelay: i * 40 + 'ms' }}
              >
                <button
                  onClick={() => toggleExpand(act.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <div className={`flex-shrink-0 w-14 text-center py-1 rounded-lg text-xs font-bold border transition-colors ${
                    act.completed
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}>
                    {act.time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm transition-colors ${act.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {act.title}
                    </p>
                    {act.assignees.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        👥 {act.assignees.slice(0, 2).join(', ')}{act.assignees.length > 2 ? ` +${act.assignees.length - 2}` : ''}
                      </p>
                    )}
                  </div>
                  {act.completed && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                  <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    {act.description && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Descrição</p>
                        <p className="text-sm text-foreground/90 leading-relaxed">{act.description}</p>
                      </div>
                    )}

                    {act.assignees.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Responsáveis
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {act.assignees.map((a, idx) => (
                            <span
                              key={idx}
                              className={`gecko-badge border ${
                                a.toLowerCase() === (user?.name || user?.email || '').toLowerCase()
                                  ? 'bg-primary/20 text-primary border-primary/40 font-semibold'
                                  : 'bg-primary/10 text-primary border-primary/20'
                              }`}
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {act.notes.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Notas
                        </p>
                        <ul className="space-y-1">
                          {act.notes.map((note, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => toggleComplete(act)}
                      disabled={!canComplete}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        !canComplete
                          ? 'bg-muted text-muted-foreground border border-border opacity-50 cursor-not-allowed'
                          : act.completed
                            ? 'bg-muted text-muted-foreground border border-border hover:border-primary/40'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {!canComplete ? '🔒 Não és responsável' : act.completed ? '↩️ Marcar como pendente' : '✅ Marcar como concluída'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showChat && <Chat onClose={() => setShowChat(false)} />}
    </div>
  );
}
