import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { parseSchemaText, validateSchemaText, exportSchemaToText } from '@/lib/schemaParser';
import { ChevronLeft, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ImportDay Page - Importar esquemas por texto
 */
export default function ImportDay() {
  const [, setLocation] = useLocation();
  const { getDays, saveDays } = useOfflineStorage();
  const { scheduleNotificationsForDay } = useNotificationManager();

  const [text, setText] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidate = () => {
    const validation = validateSchemaText(text);

    if (!validation.valid) {
      toast.error(validation.error || 'Formato inválido');
      return;
    }

    const parsed = parseSchemaText(text);
    if (parsed) {
      setPreview(parsed);
      toast.success('Esquema validado com sucesso!');
    } else {
      toast.error('Erro ao processar o esquema');
    }
  };

  const handleImport = async () => {
    if (!preview) {
      toast.error('Valide o esquema primeiro');
      return;
    }

    setIsLoading(true);
    try {
      const existingDays = await getDays();
      const updatedDays = [...existingDays, preview];
      await saveDays(updatedDays);

      // Agendar notificações
      await scheduleNotificationsForDay(preview);

      toast.success(`${preview.title} importado com sucesso!`);
      setText('');
      setPreview(null);

      // Voltar para home após 1 segundo
      setTimeout(() => setLocation('/'), 1000);
    } catch (error) {
      toast.error('Erro ao importar esquema');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyExample = () => {
    const example = `Día 7 - RUTA ALTERNATIVA
09:00 Briefing
Reunião de planeamento
- Verificar equipamento
- Confirmar grupos
Responsáveis: Nuria, Luis

09:30 Partida
Saída do acampamento
- Levar água
- Verificar mochilas

14:00 Almoço
Pausa para refeição
- Comer em grupo
- Descanso 30 minutos

18:00 Regresso
Volta ao acampamento`;

    navigator.clipboard.writeText(example);
    toast.success('Exemplo copiado!');
  };

  const handleExportPreview = () => {
    if (!preview) {
      toast.error('Nenhum esquema para exportar');
      return;
    }

    const exported = exportSchemaToText(preview);
    navigator.clipboard.writeText(exported);
    toast.success('Esquema exportado para clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream via-white to-muted pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-warm-tan bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => setLocation('/')}
            className="rounded-full p-2 hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-forest-green" />
          </button>
          <h1 className="text-2xl font-bold text-forest-green" style={{ fontFamily: "'Playfair Display', serif" }}>
            Importar Dia
          </h1>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Instructions */}
        <Card className="p-6 border-2 border-warm-tan bg-blue-50">
          <h2 className="font-bold text-charcoal mb-3">📋 Como Usar</h2>
          <ol className="space-y-2 text-sm text-charcoal">
            <li>1. Cole o esquema diário no campo abaixo</li>
            <li>2. Clique em "Validar" para verificar o formato</li>
            <li>3. Veja a pré-visualização</li>
            <li>4. Clique em "Importar" para adicionar à aplicação</li>
          </ol>
        </Card>

        {/* Input Area */}
        <Card className="p-6 border-2 border-warm-tan">
          <h2 className="font-bold text-charcoal mb-3">Colar Esquema</h2>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Día 6 - PILONES&#10;07:50 Despertador&#10;Acordar os acampados&#10;&#10;08:20 Desayuno&#10;Pequeno-almoço&#10;- Aron, Gil e Sergio ficam na instalação&#10;Responsáveis: Nuria, Paula"
            className="min-h-64 font-mono text-sm"
          />

          <div className="mt-4 flex gap-2">
            <Button
              onClick={handleValidate}
              className="flex-1 bg-forest-green hover:bg-forest-green/90"
            >
              Validar
            </Button>

            <Button
              onClick={handleCopyExample}
              variant="outline"
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Ver Exemplo
            </Button>
          </div>
        </Card>

        {/* Format Guide */}
        <Card className="p-6 border-2 border-warm-tan">
          <h2 className="font-bold text-charcoal mb-3">📝 Formato Esperado</h2>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs space-y-2 text-charcoal">
            <p><strong>Día X - TITULO</strong></p>
            <p>HH:MM Atividade</p>
            <p>Descrição da atividade</p>
            <p>- Nota 1</p>
            <p>- Nota 2</p>
            <p>Responsáveis: Pessoa1, Pessoa2</p>
            <p className="text-muted-foreground pt-2">
              (Deixe linhas em branco entre atividades)
            </p>
          </div>
        </Card>

        {/* Preview */}
        {preview && (
          <Card className="p-6 border-2 border-sky-blue bg-sky-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-charcoal">✓ Pré-visualização</h2>
              <Button
                onClick={handleExportPreview}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Título</p>
                <p className="font-bold text-charcoal">{preview.title}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase">Atividades</p>
                <div className="mt-2 space-y-2">
                  {preview.timeSlots.map((slot: any) => (
                    <div key={slot.id} className="p-2 bg-white rounded border border-border">
                      <p className="font-semibold text-sm">
                        {slot.time} - {slot.title}
                      </p>
                      {slot.assignees && slot.assignees.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          👥 {slot.assignees.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleImport}
                disabled={isLoading}
                className="w-full bg-forest-green hover:bg-forest-green/90"
              >
                {isLoading ? 'Importando...' : 'Importar Dia'}
              </Button>
            </div>
          </Card>
        )}

        {/* Tips */}
        <Card className="p-6 border-2 border-warm-tan">
          <h2 className="font-bold text-charcoal mb-3">💡 Dicas</h2>
          <ul className="space-y-2 text-sm text-charcoal">
            <li>✓ Use sempre o formato "Día X - TITULO" na primeira linha</li>
            <li>✓ Horários devem estar no formato HH:MM (ex: 08:20)</li>
            <li>✓ Notas começam com "-" (hífen)</li>
            <li>✓ Deixe linhas em branco entre atividades para melhor legibilidade</li>
            <li>✓ Responsáveis são opcionais mas recomendados</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
