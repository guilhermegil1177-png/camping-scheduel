/**
 * Campamento Gecko - Schedules Page
 * CRUD completo de cronogramas com timeline vertical
 */
import { useState, useEffect } from 'react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { useAuth } from '@/contexts/AuthContext';
import TimeSlotCard from '@/components/TimeSlotCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft, Plus, Trash2, Edit2, Calendar, Clock, Check, X
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import type { CampDay, TimeSlot } from '@/types';

export default function Schedules() {
  const { getDays, saveDays, saveDay, deleteDay } = useOfflineStorage();
  const { scheduleNotificationsForDay } = useNotificationManager();
  const { isDirector } = useAuth();
  const [, setLocation] = useLocation();

  const [days, setDays] = useState<CampDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<CampDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewDayForm, setShowNewDayForm] = useState(false);
  const [showNewSlotForm, setShowNewSlotForm] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newDayDate, setNewDayDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSlot, setNewSlot] = useState({ time: '', title: '', description: '' });

  useEffect(() => {
    getDays().then(d => { setDays(d); setIsLoading(false); });
  }, []);

  const handleCreateDay = async () => {
    if (!newDayTitle.trim()) { toast.error('Título obrigatório'); return; }
    const day: CampDay = {
      id: nanoid(),
      dayNumber: days.length + 1,
      title: newDayTitle.trim(),
      date: newDayDate,
      timeSlots: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...days, day];
    await saveDays(updated);
    setDays(updated);
    setSelectedDay(day);
    setShowNewDayForm(false);
    setNewDayTitle('');
    toast.success('Cronograma criado!');
  };

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm('Apagar este cronograma?')) return;
    await deleteDay(dayId);
    const updated = days.filter(d => d.id !== dayId);
    setDays(updated);
    if (selectedDay?.id === dayId) setSelectedDay(null);
    toast.success('Cronograma apagado');
  };

  const handleAddSlot = async () => {
    if (!selectedDay) return;
    if (!newSlot.time || !newSlot.title) { toast.error('Hora e título obrigatórios'); return; }
    const slot: TimeSlot = {
      id: nanoid(),
      schedule_id: selectedDay.id,
      time: newSlot.time,
      title: newSlot.title,
      description: newSlot.description,
      notes: [],
      assignees: [],
      completed: false,
    };
    const updatedDay = {
      ...selectedDay,
      timeSlots: [...selectedDay.timeSlots, slot].sort((a, b) => a.time.localeCompare(b.time)),
      updatedAt: Date.now(),
    };
    await saveDay(updatedDay);
    setDays(days.map(d => d.id === updatedDay.id ? updatedDay : d));
    setSelectedDay(updatedDay);
    setShowNewSlotForm(false);
    setNewSlot({ time: '', title: '', description: '' });
    toast.success('Atividade adicionada!');
  };

  const handleToggleComplete = async (slotId: string) => {
    if (!selectedDay) return;
    const updatedDay = {
      ...selectedDay,
      timeSlots: selectedDay.timeSlots.map(s =>
        s.id === slotId ? { ...s, completed: !s.completed } : s
      ),
      updatedAt: Date.now(),
    };
    await saveDay(updatedDay);
    setDays(days.map(d => d.id === updatedDay.id ? updatedDay : d));
    setSelectedDay(updatedDay);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!selectedDay) return;
    const updatedDay = {
      ...selectedDay,
      timeSlots: selectedDay.timeSlots.filter(s => s.id !== slotId),
      updatedAt: Date.now(),
    };
    await saveDay(updatedDay);
    setDays(days.map(d => d.id === updatedDay.id ? updatedDay : d));
    setSelectedDay(updatedDay);
    toast.success('Atividade removida');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gecko-bg">
        <span className="text-5xl animate-bounce">🦎</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gecko-bg pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gecko-border bg-gecko-bg/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setLocation('/')} className="rounded-full p-2 hover:bg-gecko-card transition-colors">
            <ChevronLeft className="h-5 w-5 text-gecko-muted" />
          </button>
          <h1 className="text-xl font-bold text-gecko-green font-playfair">Cronogramas</h1>
          {isDirector() && !selectedDay && (
            <Button
              onClick={() => setShowNewDayForm(true)}
              size="sm"
              className="ml-auto bg-gecko-green text-gecko-bg hover:bg-gecko-green/90"
            >
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Button>
          )}
          {selectedDay && isDirector() && (
            <Button
              onClick={() => setShowNewSlotForm(true)}
              size="sm"
              className="ml-auto bg-gecko-green text-gecko-bg hover:bg-gecko-green/90"
            >
              <Plus className="h-4 w-4 mr-1" /> Atividade
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* New Day Form */}
        {showNewDayForm && (
          <Card className="gecko-card p-4 mb-6 border-gecko-green">
            <h3 className="font-bold text-gecko-text mb-3">Novo Cronograma</h3>
            <div className="space-y-3">
              <Input
                placeholder="Título (ex: Día 7 - RUTA)"
                value={newDayTitle}
                onChange={e => setNewDayTitle(e.target.value)}
                className="bg-gecko-bg border-gecko-border text-gecko-text"
              />
              <Input
                type="date"
                value={newDayDate}
                onChange={e => setNewDayDate(e.target.value)}
                className="bg-gecko-bg border-gecko-border text-gecko-text"
              />
              <div className="flex gap-2">
                <Button onClick={handleCreateDay} className="flex-1 bg-gecko-green text-gecko-bg">
                  <Check className="h-4 w-4 mr-1" /> Criar
                </Button>
                <Button onClick={() => setShowNewDayForm(false)} variant="outline" className="flex-1 border-gecko-border text-gecko-text">
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Day List */}
        {!selectedDay && (
          <div className="space-y-3">
            {days.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">📅</span>
                <p className="text-gecko-muted">Nenhum cronograma criado</p>
                {isDirector() && (
                  <Button onClick={() => setShowNewDayForm(true)} className="mt-4 bg-gecko-green text-gecko-bg">
                    <Plus className="h-4 w-4 mr-1" /> Criar primeiro cronograma
                  </Button>
                )}
              </div>
            )}
            {days.map(day => {
              const done = day.timeSlots.filter(s => s.completed).length;
              const total = day.timeSlots.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <Card
                  key={day.id}
                  className="gecko-card p-4 cursor-pointer"
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-bold text-gecko-text">{day.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gecko-muted">
                          <Calendar className="h-3 w-3" />
                          {day.date ?? 'Sem data'}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gecko-muted">
                          <Clock className="h-3 w-3" />
                          {total} atividades
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gecko-bg overflow-hidden mt-2">
                        <div className="h-full bg-gecko-green transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gecko-muted mt-1">{done}/{total} concluídas ({pct}%)</p>
                    </div>
                    {isDirector() && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteDay(day.id); }}
                        className="ml-3 p-2 rounded-lg hover:bg-red-500/20 text-gecko-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Day Detail / Timeline */}
        {selectedDay && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gecko-muted hover:text-gecko-green transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h2 className="font-bold text-gecko-text">{selectedDay.title}</h2>
                <p className="text-xs text-gecko-muted">{selectedDay.date}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="gecko-card p-3 mb-4">
              <div className="flex justify-between text-xs text-gecko-muted mb-2">
                <span>Progresso</span>
                <span>{selectedDay.timeSlots.filter(s => s.completed).length}/{selectedDay.timeSlots.length}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gecko-bg overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gecko-green to-gecko-blue transition-all"
                  style={{
                    width: `${selectedDay.timeSlots.length > 0
                      ? (selectedDay.timeSlots.filter(s => s.completed).length / selectedDay.timeSlots.length) * 100
                      : 0}%`
                  }}
                />
              </div>
            </div>

            {/* New Slot Form */}
            {showNewSlotForm && (
              <Card className="gecko-card p-4 mb-4 border-gecko-green">
                <h3 className="font-bold text-gecko-text mb-3">Nova Atividade</h3>
                <div className="space-y-3">
                  <Input
                    type="time"
                    value={newSlot.time}
                    onChange={e => setNewSlot(s => ({ ...s, time: e.target.value }))}
                    className="bg-gecko-bg border-gecko-border text-gecko-text"
                  />
                  <Input
                    placeholder="Título da atividade"
                    value={newSlot.title}
                    onChange={e => setNewSlot(s => ({ ...s, title: e.target.value }))}
                    className="bg-gecko-bg border-gecko-border text-gecko-text"
                  />
                  <Input
                    placeholder="Descrição (opcional)"
                    value={newSlot.description}
                    onChange={e => setNewSlot(s => ({ ...s, description: e.target.value }))}
                    className="bg-gecko-bg border-gecko-border text-gecko-text"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddSlot} className="flex-1 bg-gecko-green text-gecko-bg">
                      <Check className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                    <Button onClick={() => setShowNewSlotForm(false)} variant="outline" className="flex-1 border-gecko-border text-gecko-text">
                      <X className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline */}
            {selectedDay.timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl block mb-3">⏰</span>
                <p className="text-gecko-muted">Nenhuma atividade ainda</p>
                {isDirector() && (
                  <Button onClick={() => setShowNewSlotForm(true)} className="mt-3 bg-gecko-green text-gecko-bg">
                    <Plus className="h-4 w-4 mr-1" /> Adicionar atividade
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDay.timeSlots.map((slot, index) => (
                  <div key={slot.id} className="relative">
                    <TimeSlotCard slot={slot} onToggleComplete={handleToggleComplete} />
                    {isDirector() && (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-red-500/20 text-gecko-muted hover:text-red-400 transition-colors z-10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
