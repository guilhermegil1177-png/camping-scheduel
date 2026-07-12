/**
 * Campamento Gecko - Activities Library
 * Biblioteca categorizada de atividades
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft, Plus, Search, X, Check } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import type { Activity } from '@/types';

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  outdoor: { label: 'Exterior', emoji: '🏕️', color: 'text-gecko-green border-gecko-green/30 bg-gecko-green/10' },
  indoor: { label: 'Interior', emoji: '🏠', color: 'text-gecko-blue border-gecko-blue/30 bg-gecko-blue/10' },
  craft: { label: 'Artesanato', emoji: '🎨', color: 'text-gecko-amber border-gecko-amber/30 bg-gecko-amber/10' },
  sport: { label: 'Desporto', emoji: '⚽', color: 'text-red-400 border-red-400/30 bg-red-400/10' },
  other: { label: 'Outro', emoji: '✨', color: 'text-purple-400 border-purple-400/30 bg-purple-400/10' },
};

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: nanoid(), titulo: 'Rota de Pilones', descricao: 'Rota de montanha com descida de pilones naturais',
    categoria: 'outdoor', instrucoes: 'Briefing obrigatório. Grupos de 10-12 miúdos com monitor.',
    materiais: ['Água', 'Mochila', 'Calçado adequado', 'Protetor solar'],
    duracao: 240, dificuldade: 'dificil', criado_por: 'system',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(), titulo: 'Velada das Estrelas', descricao: 'Histórias e relaxamento sob as estrelas',
    categoria: 'outdoor', instrucoes: 'Levar mantas. Música suave de fundo.',
    materiais: ['Mantas', 'Lanternas', 'Música'],
    duracao: 60, dificuldade: 'facil', criado_por: 'system',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(), titulo: 'Jogos de Mesa', descricao: 'Jogos de tabuleiro e cartas em grupo',
    categoria: 'indoor', instrucoes: 'Dividir em grupos de 4-6 pessoas.',
    materiais: ['Jogos de mesa', 'Cartas'],
    duracao: 90, dificuldade: 'facil', criado_por: 'system',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(), titulo: 'Pulseiras de Amizade', descricao: 'Fazer pulseiras com fios coloridos',
    categoria: 'craft', instrucoes: 'Preparar fios com antecedência. Tutorial simples.',
    materiais: ['Fios coloridos', 'Tesouras', 'Agulhas'],
    duracao: 60, dificuldade: 'facil', criado_por: 'system',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
  {
    id: nanoid(), titulo: 'Torneio de Futebol', descricao: 'Mini torneio de futebol entre grupos',
    categoria: 'sport', instrucoes: 'Equipas de 5. Jogos de 10 minutos.',
    materiais: ['Bolas', 'Coletes', 'Balizas'],
    duracao: 120, dificuldade: 'medio', criado_por: 'system',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  },
];

export default function Activities() {
  const { isDirector } = useAuth();
  const [, setLocation] = useLocation();
  const [activities, setActivities] = useState<Activity[]>(SAMPLE_ACTIVITIES);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Activity | null>(null);
  const [newActivity, setNewActivity] = useState({
    titulo: '', descricao: '', categoria: 'outdoor' as Activity['categoria'],
    instrucoes: '', duracao: '', dificuldade: 'facil' as Activity['dificuldade'],
    materiais: '',
  });

  const filtered = activities.filter(a => {
    const matchSearch = a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      a.descricao.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || a.categoria === filterCat;
    return matchSearch && matchCat;
  });

  const handleCreate = () => {
    if (!newActivity.titulo.trim()) { toast.error('Título obrigatório'); return; }
    const activity: Activity = {
      id: nanoid(),
      titulo: newActivity.titulo,
      descricao: newActivity.descricao,
      categoria: newActivity.categoria,
      instrucoes: newActivity.instrucoes,
      materiais: newActivity.materiais.split(',').map(m => m.trim()).filter(Boolean),
      duracao: parseInt(newActivity.duracao) || undefined,
      dificuldade: newActivity.dificuldade,
      criado_por: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setActivities(prev => [activity, ...prev]);
    setShowForm(false);
    setNewActivity({ titulo: '', descricao: '', categoria: 'outdoor', instrucoes: '', duracao: '', dificuldade: 'facil', materiais: '' });
    toast.success('Atividade criada!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Apagar esta atividade?')) return;
    setActivities(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Atividade apagada');
  };

  return (
    <div className="min-h-screen bg-gecko-bg pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gecko-border bg-gecko-bg/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation('/')} className="rounded-full p-2 hover:bg-gecko-card transition-colors">
            <ChevronLeft className="h-5 w-5 text-gecko-muted" />
          </button>
          <h1 className="text-xl font-bold text-gecko-green font-playfair">Biblioteca de Atividades</h1>
          {isDirector() && (
            <Button onClick={() => setShowForm(true)} size="sm" className="ml-auto bg-gecko-green text-gecko-bg">
              <Plus className="h-4 w-4 mr-1" /> Nova
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gecko-muted" />
          <Input
            placeholder="Pesquisar atividades..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-gecko-card border-gecko-border text-gecko-text placeholder:text-gecko-muted"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              filterCat === 'all'
                ? 'bg-gecko-green text-gecko-bg border-gecko-green'
                : 'border-gecko-border text-gecko-muted hover:border-gecko-green'
            }`}
          >
            Todas ({activities.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, { label, emoji }]) => (
            <button
              key={key}
              onClick={() => setFilterCat(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                filterCat === key
                  ? 'bg-gecko-green text-gecko-bg border-gecko-green'
                  : 'border-gecko-border text-gecko-muted hover:border-gecko-green'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* New Activity Form */}
        {showForm && (
          <Card className="gecko-card p-4 border-gecko-green">
            <h3 className="font-bold text-gecko-text mb-3">Nova Atividade</h3>
            <div className="space-y-3">
              <Input placeholder="Título *" value={newActivity.titulo}
                onChange={e => setNewActivity(s => ({ ...s, titulo: e.target.value }))}
                className="bg-gecko-bg border-gecko-border text-gecko-text" />
              <Input placeholder="Descrição" value={newActivity.descricao}
                onChange={e => setNewActivity(s => ({ ...s, descricao: e.target.value }))}
                className="bg-gecko-bg border-gecko-border text-gecko-text" />
              <select value={newActivity.categoria}
                onChange={e => setNewActivity(s => ({ ...s, categoria: e.target.value as any }))}
                className="w-full rounded-md border border-gecko-border bg-gecko-bg text-gecko-text px-3 py-2 text-sm">
                {Object.entries(CATEGORY_LABELS).map(([k, { label, emoji }]) => (
                  <option key={k} value={k}>{emoji} {label}</option>
                ))}
              </select>
              <Input placeholder="Instruções" value={newActivity.instrucoes}
                onChange={e => setNewActivity(s => ({ ...s, instrucoes: e.target.value }))}
                className="bg-gecko-bg border-gecko-border text-gecko-text" />
              <Input placeholder="Materiais (separados por vírgula)" value={newActivity.materiais}
                onChange={e => setNewActivity(s => ({ ...s, materiais: e.target.value }))}
                className="bg-gecko-bg border-gecko-border text-gecko-text" />
              <div className="flex gap-2">
                <Input placeholder="Duração (min)" type="number" value={newActivity.duracao}
                  onChange={e => setNewActivity(s => ({ ...s, duracao: e.target.value }))}
                  className="bg-gecko-bg border-gecko-border text-gecko-text" />
                <select value={newActivity.dificuldade}
                  onChange={e => setNewActivity(s => ({ ...s, dificuldade: e.target.value as any }))}
                  className="flex-1 rounded-md border border-gecko-border bg-gecko-bg text-gecko-text px-3 py-2 text-sm">
                  <option value="facil">🟢 Fácil</option>
                  <option value="medio">🟡 Médio</option>
                  <option value="dificil">🔴 Difícil</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1 bg-gecko-green text-gecko-bg">
                  <Check className="h-4 w-4 mr-1" /> Criar
                </Button>
                <Button onClick={() => setShowForm(false)} variant="outline" className="flex-1 border-gecko-border text-gecko-text">
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Activity Detail Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
            <Card className="gecko-card w-full max-w-lg p-6 mb-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${CATEGORY_LABELS[selected.categoria].color}`}>
                    {CATEGORY_LABELS[selected.categoria].emoji} {CATEGORY_LABELS[selected.categoria].label}
                  </span>
                  <h2 className="text-xl font-bold text-gecko-text mt-2">{selected.titulo}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-gecko-muted hover:text-gecko-text">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gecko-muted text-sm mb-4">{selected.descricao}</p>
              {selected.instrucoes && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gecko-muted uppercase mb-1">Instruções</p>
                  <p className="text-sm text-gecko-text">{selected.instrucoes}</p>
                </div>
              )}
              {selected.materiais.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gecko-muted uppercase mb-2">Materiais</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.materiais.map((m, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-gecko-card border border-gecko-border text-gecko-text">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-4 text-xs text-gecko-muted mt-4">
                {selected.duracao && <span>⏱️ {selected.duracao} min</span>}
                {selected.dificuldade && (
                  <span>{selected.dificuldade === 'facil' ? '🟢' : selected.dificuldade === 'medio' ? '🟡' : '🔴'} {selected.dificuldade}</span>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-gecko-muted">Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(activity => {
              const cat = CATEGORY_LABELS[activity.categoria];
              return (
                <Card
                  key={activity.id}
                  className="gecko-card p-4 cursor-pointer"
                  onClick={() => setSelected(activity)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cat.color}`}>
                      {cat.emoji} {cat.label}
                    </span>
                    {isDirector() && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(activity.id); }}
                        className="p-1 rounded hover:bg-red-500/20 text-gecko-muted hover:text-red-400 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-gecko-text mb-1">{activity.titulo}</h3>
                  <p className="text-xs text-gecko-muted line-clamp-2">{activity.descricao}</p>
                  <div className="flex gap-3 mt-3 text-xs text-gecko-muted">
                    {activity.duracao && <span>⏱️ {activity.duracao}min</span>}
                    {activity.dificuldade && (
                      <span>{activity.dificuldade === 'facil' ? '🟢' : activity.dificuldade === 'medio' ? '🟡' : '🔴'} {activity.dificuldade}</span>
                    )}
                    {activity.materiais.length > 0 && <span>📦 {activity.materiais.length} materiais</span>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
