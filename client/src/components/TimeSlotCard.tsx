import { useState } from 'react';
import { ChevronDown, Check, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TimeSlot } from '@/types';

interface TimeSlotCardProps {
  slot: TimeSlot;
  onToggleComplete?: (id: string) => void;
}

export default function TimeSlotCard({ slot, onToggleComplete }: TimeSlotCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        relative mb-3 rounded-xl border transition-all duration-300
        ${slot.completed
          ? 'border-gecko-green/50 bg-gecko-green/5'
          : 'border-gecko-border bg-gecko-card hover:border-gecko-green/40'
        }
        hover:shadow-lg hover:shadow-gecko-green/5
      `}
    >
      {/* Time Badge */}
      <div className={`
        absolute -left-3 top-4 flex h-12 w-12 items-center justify-center rounded-full
        font-mono font-bold text-xs shadow-md border
        ${slot.completed
          ? 'bg-gecko-green text-gecko-bg border-gecko-green'
          : 'bg-gecko-bg text-gecko-green border-gecko-green/50'
        }
      `}>
        {slot.time}
      </div>

      {/* Card Content */}
      <div className="ml-8 p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className={`text-base font-semibold font-montserrat ${slot.completed ? 'text-gecko-muted line-through' : 'text-gecko-text'}`}>
              {slot.title}
            </h3>
            {slot.description && (
              <p className="mt-0.5 text-sm text-gecko-muted line-clamp-1">
                {slot.description}
              </p>
            )}
            {/* Quick info */}
            <div className="flex items-center gap-3 mt-1">
              {slot.assignees && slot.assignees.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gecko-muted">
                  <Users className="h-3 w-3" />
                  {slot.assignees.length} responsáveis
                </span>
              )}
              {slot.notes && slot.notes.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gecko-muted">
                  <FileText className="h-3 w-3" />
                  {slot.notes.length} notas
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {slot.completed && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gecko-green">
                <Check className="h-4 w-4 text-gecko-bg" />
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0 text-gecko-muted hover:text-gecko-text hover:bg-gecko-bg"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-3 border-t border-gecko-border pt-4 animate-in">
            {slot.description && (
              <div>
                <p className="text-xs font-semibold text-gecko-muted uppercase tracking-wider mb-1">Descrição</p>
                <p className="text-sm text-gecko-text">{slot.description}</p>
              </div>
            )}

            {slot.notes && slot.notes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gecko-muted uppercase tracking-wider mb-2">Notas</p>
                <ul className="space-y-1.5">
                  {slot.notes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gecko-text">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gecko-green flex-shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {slot.assignees && slot.assignees.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gecko-muted uppercase tracking-wider mb-2">Responsáveis</p>
                <div className="flex flex-wrap gap-2">
                  {slot.assignees.map((assignee, idx) => (
                    <span
                      key={idx}
                      className="inline-block rounded-full bg-gecko-blue/10 border border-gecko-blue/30 px-3 py-1 text-xs font-medium text-gecko-blue"
                    >
                      {assignee}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {onToggleComplete && (
              <Button
                onClick={() => onToggleComplete(slot.id)}
                variant={slot.completed ? 'outline' : 'default'}
                className={`mt-2 w-full ${
                  slot.completed
                    ? 'border-gecko-border text-gecko-muted hover:bg-gecko-bg'
                    : 'bg-gecko-green text-gecko-bg hover:bg-gecko-green/90'
                }`}
              >
                {slot.completed ? 'Marcar como Pendente' : '✓ Marcar Concluído'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
