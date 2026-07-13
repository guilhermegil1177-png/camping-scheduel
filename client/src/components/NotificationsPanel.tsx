import { X, Bell } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const DEMO_NOTIFS = [
  { id: '1', title: 'Atividade em 15 min', body: 'Despertador às 07:50', time: 'há 2 min', read: false },
  { id: '2', title: 'Nova nota adicionada', body: 'Garrafas de água — Luis e Ainara', time: 'há 10 min', read: false },
  { id: '3', title: 'Cronograma atualizado', body: 'Día 7 - OLIMPIADAS foi editado', time: 'há 1h', read: true },
];

export default function NotificationsPanel({ onClose }: Props) {
  return (
    <div className="border-b border-border bg-card shadow-lg animate-slide-up">
      <div className="container mx-auto px-4 py-3 max-w-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notificações
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {DEMO_NOTIFS.map(n => (
            <div key={n.id} className={`rounded-xl p-3 border ${n.read ? 'border-border bg-muted/30' : 'border-primary/30 bg-primary/5'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-semibold ${n.read ? 'text-muted-foreground' : 'text-foreground'}`}>{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
