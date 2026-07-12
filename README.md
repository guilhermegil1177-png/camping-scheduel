# 🏕️ Camp Daily Scheduler

Uma aplicação PWA (Progressive Web App) para gerir esquemas diários de acampamento com suporte offline, notificações automáticas e sincronização com Supabase.

## ✨ Características

### 📱 Funcionalidades Principais
- **Timeline Vertical** - Visualização clara de todas as atividades do dia
- **Cards Expansíveis** - Detalhes completos, notas e responsáveis
- **Importar Esquemas** - Cole texto formatado e cria automaticamente
- **Notificações** - Alertas 10 minutos antes de cada atividade
- **Offline First** - Funciona completamente sem internet
- **Sincronização** - Supabase para backup e sincronização

### 🎨 Design
- **Outdoor Adventure Aesthetic** - Paleta terrestre e cores naturais
- **Responsive** - Otimizado para iPhone, iPad e desktop
- **Dark Mode** - Adapta-se automaticamente ao tema do dispositivo
- **Animações Suaves** - Transições elegantes e responsivas

### 🔔 Notificações
- Alertas automáticos 10 minutos antes de cada atividade
- Funciona mesmo com a app fechada
- Verificação a cada minuto
- Fallback com toasts no navegador

### 💾 Armazenamento
- **IndexedDB** - Dados locais no dispositivo
- **Service Worker** - Cache automático
- **Supabase** - Sincronização em nuvem (opcional)

---

## 🚀 Quick Start

### Instalação
```bash
# Clonar repositório
git clone https://github.com/seu-usuario/camp-scheduler.git
cd camp-scheduler

# Instalar dependências
pnpm install

# Desenvolvimento
pnpm dev

# Build
pnpm build
```

### Usar a Aplicação
1. **Abrir** em `http://localhost:3000`
2. **Importar Dia** - Toque no ícone de upload
3. **Cole o esquema** - Formato:
   ```
   Día X - TITULO
   HH:MM Atividade
   Descrição
   - Nota 1
   - Nota 2
   Responsáveis: Pessoa1, Pessoa2
   ```
4. **Validar** e **Importar**

---

## 📋 Formato de Importação

### Exemplo Completo
```
Día 6 - PILONES
07:50 Despertador
Acordar os acampados

08:20 Desayuno
Pequeno-almoço
- Aron, Gil e Sergio ficam na instalação
- Ruta: Nuria abre a ruta
Responsáveis: Nuria, Paula, Ainara

08:45 Salida en bus
Saída em autocarro para Jerte
- Levar garrafas de água
- Levar jogos de mesa
Responsáveis: Luis, Ainara
```

### Regras
- ✅ Primeira linha: `Día X - TITULO`
- ✅ Horários: `HH:MM Atividade`
- ✅ Notas: Começam com `-`
- ✅ Responsáveis: `Responsáveis: Pessoa1, Pessoa2`
- ✅ Deixe linhas em branco entre atividades

---

## 🔧 Configuração

### Variáveis de Ambiente
Crie `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase (Opcional)
1. Crie um projeto em [supabase.com](https://supabase.com)
2. Configure as tabelas (veja `DEPLOYMENT_GUIDE.md`)
3. Copie as credenciais para `.env.local`

---

## 📱 Instalar no iPhone

### Via Safari
1. Abra em Safari
2. Toque em **Partilhar** (seta para cima)
3. Selecione **"Adicionar à Tela Inicial"**
4. Escolha um nome e toque em **"Adicionar"**

### Ativar Notificações
1. Toque no ícone ⚙️ (Configurações)
2. Selecione **"Ativar Notificações"**
3. Permita no navegador

---

## 🌐 Publicar em Vercel

### Passo 1: GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/camp-scheduler.git
git push -u origin main
```

### Passo 2: Vercel
1. Aceda a [vercel.com/new](https://vercel.com/new)
2. Importe o repositório GitHub
3. Configure variáveis de ambiente
4. Clique em "Deploy"

### Passo 3: Domínio Personalizado (Opcional)
1. No painel do Vercel: **Settings > Domains**
2. Adicione seu domínio
3. Configure DNS no seu registrador

Veja `DEPLOYMENT_GUIDE.md` para instruções detalhadas.

---

## 🏗️ Arquitetura

### Frontend
- **React 19** - Framework UI
- **Wouter** - Roteamento leve
- **Tailwind CSS 4** - Estilos
- **shadcn/ui** - Componentes

### Storage
- **IndexedDB** - Dados locais
- **Service Worker** - Cache offline
- **Supabase** - Backend (opcional)

### PWA
- **manifest.json** - Metadados da app
- **Service Worker** - Funcionamento offline
- **Notificações** - API de notificações do navegador

---

## 📚 Estrutura de Ficheiros

```
camp-scheduler/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Página principal
│   │   │   ├── ImportDay.tsx     # Importar esquemas
│   │   │   └── Settings.tsx      # Configurações
│   │   ├── components/
│   │   │   └── TimeSlotCard.tsx  # Card de atividade
│   │   ├── hooks/
│   │   │   ├── useOfflineStorage.ts
│   │   │   └── useNotificationManager.ts
│   │   ├── lib/
│   │   │   ├── schemaParser.ts   # Parser de esquemas
│   │   │   └── sampleData.ts     # Dados de exemplo
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   │   ├── manifest.json
│   │   └── sw.js
│   └── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── INSTALLATION_GUIDE.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## 🧪 Desenvolvimento

### Scripts Disponíveis
```bash
pnpm dev      # Servidor de desenvolvimento
pnpm build    # Build para produção
pnpm preview  # Preview do build
pnpm check    # Verificar tipos TypeScript
pnpm format   # Formatar código
```

### Debug
- **DevTools** - F12 no navegador
- **Service Worker** - DevTools > Application > Service Workers
- **IndexedDB** - DevTools > Application > Storage > IndexedDB
- **Notificações** - DevTools > Console

---

## 🐛 Troubleshooting

### Notificações não funcionam
- Verifique se permitiu notificações no navegador
- Tente "Testar Notificações" nas Configurações
- Certifique-se de que o iPhone não está em modo silencioso

### Dados desapareceram
- Os dados são armazenados localmente
- Se limpou o cache do Safari, os dados podem ter sido apagados
- Use Supabase para backup automático

### Build falha
```bash
pnpm check    # Verificar erros de tipo
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📄 Licença

MIT - Veja LICENSE para detalhes

---

## 👨‍💻 Desenvolvido com

- React 19
- Tailwind CSS 4
- shadcn/ui
- Vite
- TypeScript

---

## 📞 Suporte

Para problemas ou sugestões:
1. Verifique a documentação
2. Consulte `INSTALLATION_GUIDE.md` ou `DEPLOYMENT_GUIDE.md`
3. Abra uma issue no GitHub

---

**Versão**: 1.0.0  
**Última atualização**: Julho 2026  
**Compatibilidade**: iOS 12+, Android 5+, Desktop (Chrome, Safari, Firefox)
