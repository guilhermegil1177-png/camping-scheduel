import { nanoid } from 'nanoid';
import type { CampDay, TimeSlot } from '@/types';

/**
 * Parser para converter texto de esquema diário em estrutura CampDay
 * Formato esperado:
 * 
 * Día X - TITULO
 * HH:MM Atividade
 * Descrição da atividade
 * - Nota 1
 * - Nota 2
 * Responsáveis: Pessoa1, Pessoa2
 */

export const parseSchemaText = (text: string): CampDay | null => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) return null;

  // Parse do título (primeira linha)
  const titleLine = lines[0];
  const titleMatch = titleLine.match(/Día\s+(\d+)\s*-\s*(.+)/i);
  
  if (!titleMatch) {
    console.error('Formato inválido. Primeira linha deve ser: "Día X - TITULO"');
    return null;
  }

  const dayNumber = parseInt(titleMatch[1]);
  const title = titleMatch[2].trim();

  const timeSlots: TimeSlot[] = [];
  let currentSlot: Partial<TimeSlot> | null = null;
  let currentNotes: string[] = [];
  let currentAssignees: string[] = [];

  // Parse das linhas restantes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];

    // Detectar linha de horário (HH:MM)
    const timeMatch = line.match(/^(\d{2}):(\d{2})\s+(.+)/);
    
    if (timeMatch) {
      // Salvar slot anterior se existir
      if (currentSlot && currentSlot.time) {
        timeSlots.push({
          id: nanoid(),
          time: currentSlot.time,
          title: currentSlot.title || '',
          description: currentSlot.description || '',
          notes: currentNotes,
          assignees: currentAssignees,
          completed: false,
        });
      }

      // Iniciar novo slot
      const hours = timeMatch[1];
      const minutes = timeMatch[2];
      const activityTitle = timeMatch[3].trim();

      currentSlot = {
        time: `${hours}:${minutes}`,
        title: activityTitle,
        description: '',
      };
      currentNotes = [];
      currentAssignees = [];
    } else if (line.startsWith('-') && currentSlot) {
      // Nota (começa com -)
      const note = line.substring(1).trim();
      currentNotes.push(note);
    } else if (line.toLowerCase().startsWith('responsáveis:') || line.toLowerCase().startsWith('responsables:')) {
      // Responsáveis
      const assigneesText = line.split(':')[1].trim();
      currentAssignees = assigneesText
        .split(',')
        .map(name => name.trim())
        .filter(name => name.length > 0);
    } else if (line.toLowerCase().startsWith('atenção:') || line.toLowerCase().startsWith('atención:')) {
      // Seção de atenção (adicionar como nota)
      const attentionText = line.split(':')[1].trim();
      if (attentionText) {
        currentNotes.push(`⚠️ ${attentionText}`);
      }
    } else if (currentSlot && currentSlot.time && !currentSlot.description) {
      // Primeira linha após horário é a descrição
      currentSlot.description = line;
    } else if (currentSlot && currentSlot.description && line.length > 0) {
      // Linhas adicionais são notas se não começarem com -
      if (!line.startsWith('-') && !line.toLowerCase().includes('responsáveis') && !line.toLowerCase().includes('responsables')) {
        currentNotes.push(line);
      }
    }
  }

  // Salvar último slot
  if (currentSlot && currentSlot.time) {
    timeSlots.push({
      id: nanoid(),
      time: currentSlot.time,
      title: currentSlot.title || '',
      description: currentSlot.description || '',
      notes: currentNotes,
      assignees: currentAssignees,
      completed: false,
    });
  }

  if (timeSlots.length === 0) {
    console.error('Nenhuma atividade encontrada no texto');
    return null;
  }

  const campDay: CampDay = {
    id: nanoid(),
    dayNumber,
    title: `Día ${dayNumber} - ${title}`,
    date: new Date().toISOString().split('T')[0],
    timeSlots,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return campDay;
};

/**
 * Validar se o texto tem o formato correto
 */
export const validateSchemaText = (text: string): { valid: boolean; error?: string } => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return { valid: false, error: 'Texto vazio' };
  }

  const titleMatch = lines[0].match(/Día\s+(\d+)\s*-\s*(.+)/i);
  if (!titleMatch) {
    return {
      valid: false,
      error: 'Primeira linha deve ser: "Día X - TITULO"',
    };
  }

  const timeMatches = lines.filter(line => /^\d{2}:\d{2}\s+/.test(line));
  if (timeMatches.length === 0) {
    return {
      valid: false,
      error: 'Nenhuma atividade encontrada. Use formato: "HH:MM Atividade"',
    };
  }

  return { valid: true };
};

/**
 * Exportar CampDay para formato de texto
 */
export const exportSchemaToText = (day: CampDay): string => {
  let text = `${day.title}\n`;

  day.timeSlots.forEach(slot => {
    text += `${slot.time} ${slot.title}\n`;
    if (slot.description) {
      text += `${slot.description}\n`;
    }
    slot.notes.forEach(note => {
      text += `- ${note}\n`;
    });
    if (slot.assignees && slot.assignees.length > 0) {
      text += `Responsáveis: ${slot.assignees.join(', ')}\n`;
    }
    text += '\n';
  });

  return text;
};
