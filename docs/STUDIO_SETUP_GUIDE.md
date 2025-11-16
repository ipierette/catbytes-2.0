# 🎬 CatBytes Media Studio - Guia Completo de Setup

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração de APIs Externas](#configuração-de-apis-externas)
3. [Configuração do FFmpeg](#configuração-do-ffmpeg)
4. [APIs do Backend](#apis-do-backend)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Dependências NPM Necessárias

```bash
npm install react-dropzone @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Estrutura de Arquivos Críticos

```
lib/
  supabase/
    client.ts          # ✅ Cliente Supabase para browser
  supabase.ts          # ✅ Cliente Supabase para server-side
  
components/
  studio/
    asset-uploader.tsx # Upload de assets (vídeo, áudio, imagem)
    video-editor/      # Editor principal
    script-generator.tsx
    narration-generator.tsx
    video-renderer.tsx
    social-publisher.tsx
```

---

## 🌐 Configuração de APIs Externas

### 1. OpenAI API (GPT-4 + DALL-E 3)

**Usada para:**
- Script Generator (GPT-4)
- Geração de imagens para landing pages (DALL-E 3)

**Como obter:**
1. Acesse https://platform.openai.com/api-keys
2. Crie uma nova API key
3. Adicione ao `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Custo aproximado:**
- GPT-4: ~$0.03 por 1K tokens (input) / $0.06 por 1K tokens (output)
- DALL-E 3 HD: ~$0.080 por imagem 1024x1024

---

### 2. Eleven Labs API (Text-to-Speech)

**Usada para:**
- Narration Generator (voz AI profissional)

**Como obter:**
1. Acesse https://elevenlabs.io/
2. Crie uma conta (Free tier: 10,000 caracteres/mês)
3. Vá em **Profile** → **API Keys**
4. Copie a API key
5. Adicione ao `.env.local`:

```bash
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx
```

**Modelos de voz disponíveis:**
- `eleven_monolingual_v1` (Inglês, melhor qualidade)
- `eleven_multilingual_v2` (Português suportado)

**IDs de vozes recomendadas:**
```typescript
// Masculinas
const MALE_VOICES = [
  'ErXwobaYiN019PkySvjV', // Antoni (profissional)
  'VR6AewLTigWG4xSOukaG', // Arnold (autoritário)
]

// Femininas
const FEMALE_VOICES = [
  'EXAVITQu4vr4xnSDxMaL', // Bella (amigável)
  'MF3mGyEYCl7XYWbV9V6O', // Elli (jornalística)
]
```

---

### 3. Supabase Storage

**Configuração dos Buckets:**

```sql
-- Bucket para vídeos e assets do Studio
CREATE BUCKET videos (
  public = true,
  file_size_limit = 500MB,
  allowed_mime_types = ['video/*', 'audio/*', 'image/*']
);

-- Bucket para imagens de landing pages
CREATE BUCKET instagram-images (
  public = true,
  file_size_limit = 10MB,
  allowed_mime_types = ['image/*']
);
```

**Paths no código:**
```typescript
// AssetUploader
const filePath = `studio/${type}s/${fileName}` // videos bucket

// Landing Pages
const filePath = `lp-hero/${niche}-${title}-${timestamp}.webp` // instagram-images bucket
```

---

## 🎥 Configuração do FFmpeg

### O que é FFmpeg?

FFmpeg é a biblioteca essencial para processar vídeos no Media Studio. Ele:
- Corta e edita clipes
- Aplica efeitos visuais
- Mescla áudio e vídeo
- Converte formatos (MP4, WebM, MOV)
- Ajusta resolução e aspect ratio

### Opções de Deploy do FFmpeg

#### Opção 1: FFmpeg.wasm (Browser-Side) ⚠️ **Não Recomendado para Produção**

**Prós:**
- Funciona no navegador
- Não precisa de servidor

**Contras:**
- Performance MUITO lenta (10-50x mais lento)
- Limita tamanho de vídeos (~100MB)
- Consome muita RAM do cliente
- Pode travar navegadores antigos

```typescript
// ❌ NÃO USE EM PRODUÇÃO
import { createFFmpeg } from '@ffmpeg/ffmpeg'

const ffmpeg = createFFmpeg({ log: true })
await ffmpeg.load()
```

#### Opção 2: FFmpeg Server-Side (Serverless) ✅ **RECOMENDADO**

**Usando Lambda Functions com FFmpeg Layer:**

1. **Criar Lambda Function:**

```bash
# AWS Lambda configuration
Runtime: Node.js 18.x
Memory: 3008 MB (máximo)
Timeout: 900 seconds (15 minutos)
Ephemeral storage: 10 GB
```

2. **Adicionar FFmpeg Layer:**

Use o layer público do `serverlesspub`:
```
arn:aws:lambda:us-east-1:145266761615:layer:ffmpeg:4
```

Ou crie seu próprio:
```bash
# Criar layer customizado
mkdir -p ffmpeg-layer/bin
cd ffmpeg-layer

# Download FFmpeg static build
wget https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-amd64-static.tar.xz
tar -xf ffmpeg-git-amd64-static.tar.xz
cp ffmpeg-*-static/ffmpeg bin/
cp ffmpeg-*-static/ffprobe bin/

# Zipar e fazer upload
zip -r ffmpeg-layer.zip .
aws lambda publish-layer-version \
  --layer-name ffmpeg \
  --zip-file fileb://ffmpeg-layer.zip \
  --compatible-runtimes nodejs18.x
```

3. **Código da Lambda Function:**

```typescript
// /functions/render-video/index.ts
import { S3 } from '@aws-sdk/client-s3'
import { spawn } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import path from 'path'

const s3 = new S3()

export const handler = async (event: any) => {
  const { clips, effects, outputFormat, quality } = JSON.parse(event.body)
  
  try {
    // 1. Baixar clips do S3/Supabase
    const clipFiles = await Promise.all(
      clips.map(async (clip: any, idx: number) => {
        const response = await fetch(clip.url)
        const buffer = await response.arrayBuffer()
        const filePath = `/tmp/clip_${idx}.mp4`
        await writeFile(filePath, Buffer.from(buffer))
        return filePath
      })
    )
    
    // 2. Criar filtros FFmpeg
    const filters = buildFFmpegFilters(clips, effects)
    
    // 3. Executar FFmpeg
    const outputPath = '/tmp/final_output.mp4'
    await runFFmpeg(clipFiles, filters, outputPath, quality)
    
    // 4. Upload para S3/Supabase
    const outputBuffer = await readFile(outputPath)
    const finalUrl = await uploadToStorage(outputBuffer, outputFormat)
    
    // 5. Limpar arquivos temporários
    await Promise.all([
      ...clipFiles.map(f => unlink(f)),
      unlink(outputPath)
    ])
    
    return {
      statusCode: 200,
      body: JSON.stringify({ videoUrl: finalUrl })
    }
  } catch (error) {
    console.error('FFmpeg error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

function buildFFmpegFilters(clips: any[], effects: any[]) {
  let filters: string[] = []
  
  clips.forEach((clip, idx) => {
    // Trim
    if (clip.trimStart || clip.trimEnd) {
      filters.push(`[${idx}:v]trim=start=${clip.trimStart}:end=${clip.trimEnd},setpts=PTS-STARTPTS[v${idx}]`)
    }
    
    // Effects
    effects.forEach(effect => {
      if (effect.clipId === clip.id) {
        switch (effect.type) {
          case 'brightness':
            filters.push(`[v${idx}]eq=brightness=${effect.value}[v${idx}]`)
            break
          case 'blur':
            filters.push(`[v${idx}]boxblur=${effect.value}[v${idx}]`)
            break
          // ... outros efeitos
        }
      }
    })
  })
  
  // Concatenar clipes
  const concatFilter = clips.map((_, idx) => `[v${idx}]`).join('') + 
                       `concat=n=${clips.length}:v=1:a=0[outv]`
  filters.push(concatFilter)
  
  return filters.join(';')
}

async function runFFmpeg(
  inputs: string[], 
  filters: string, 
  output: string,
  quality: string
) {
  const args = [
    ...inputs.flatMap(f => ['-i', f]),
    '-filter_complex', filters,
    '-map', '[outv]',
    '-c:v', 'libx264',
    '-preset', quality === '4k' ? 'slow' : 'medium',
    '-crf', quality === '4k' ? '18' : '23',
    output
  ]
  
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('/opt/bin/ffmpeg', args)
    
    ffmpeg.stderr.on('data', (data) => {
      console.log(`FFmpeg: ${data}`)
    })
    
    ffmpeg.on('close', (code) => {
      code === 0 ? resolve(output) : reject(new Error(`FFmpeg exited with ${code}`))
    })
  })
}
```

4. **API Route no Next.js:**

```typescript
// app/api/studio/render-video/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Invocar Lambda
  const response = await fetch(process.env.LAMBDA_RENDER_ENDPOINT!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  
  const result = await response.json()
  return NextResponse.json(result)
}
```

#### Opção 3: Vercel + FFmpeg Docker Container ✅ **Alternativa Moderna**

**Usando Vercel Edge Functions + Docker:**

1. **Criar Dockerfile:**

```dockerfile
FROM node:18-slim

# Instalar FFmpeg
RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
```

2. **Deploy no Railway/Render:**

```bash
# Railway
railway up

# Render
render deploy
```

3. **Chamar do Next.js:**

```typescript
// app/api/studio/render-video/route.ts
const response = await fetch(`${process.env.FFMPEG_SERVICE_URL}/render`, {
  method: 'POST',
  body: JSON.stringify(renderConfig)
})
```

---

## 📡 APIs do Backend

### APIs Obrigatórias para o Studio

#### 1. Upload de Assets
```
POST /api/studio/upload
```

**Já implementado:** ✅ `AssetUploader` faz upload direto para Supabase Storage

#### 2. CRUD de Projetos
```
GET    /api/studio/projects
POST   /api/studio/projects
GET    /api/studio/projects/[id]
PUT    /api/studio/projects/[id]
DELETE /api/studio/projects/[id]
```

**Criar arquivo:** `app/api/studio/projects/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('studio_projects')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('studio_projects')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
```

#### 3. Script Generator
```
POST /api/studio/generate-script
```

**Criar arquivo:** `app/api/studio/generate-script/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(req: NextRequest) {
  try {
    const { topic, duration, style } = await req.json()
    
    const prompt = `Crie um roteiro de vídeo para YouTube sobre "${topic}".
Duração: ${duration} segundos
Estilo: ${style}

O roteiro deve incluir:
- Hook inicial (primeiros 5 segundos)
- Desenvolvimento em 3 pontos principais
- Call-to-action final

Formato: JSON com { hook, points: [], cta }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Você é um roteirista especialista em vídeos virais.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8
    })
    
    const script = JSON.parse(response.choices[0].message.content || '{}')
    
    return NextResponse.json({ script })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

#### 4. Narration Generator
```
POST /api/studio/generate-narration
```

**Criar arquivo:** `app/api/studio/generate-narration/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, stability = 0.5, similarity_boost = 0.75 } = await req.json()
    
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost
          }
        })
      }
    )
    
    if (!response.ok) {
      throw new Error(`Eleven Labs error: ${response.statusText}`)
    }
    
    // Upload áudio para Supabase
    const audioBuffer = await response.arrayBuffer()
    const fileName = `narration-${Date.now()}.mp3`
    
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`studio/audios/${fileName}`, audioBuffer, {
        contentType: 'audio/mpeg'
      })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(`studio/audios/${fileName}`)
    
    return NextResponse.json({ audioUrl: publicUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

#### 5. Video Renderer
```
POST /api/studio/render-video
```

**Implementação depende da escolha do FFmpeg (Lambda ou Container)**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { clips, effects, format, quality, aspectRatio } = await req.json()
  
  // Chamar serviço FFmpeg (Lambda ou Container)
  const response = await fetch(process.env.FFMPEG_SERVICE_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clips,
      effects,
      output: {
        format,
        quality,
        aspectRatio
      }
    })
  })
  
  const { videoUrl, jobId } = await response.json()
  
  return NextResponse.json({ videoUrl, jobId })
}
```

#### 6. Render Status
```
GET /api/studio/render-status/[jobId]
```

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params
  
  // Consultar status no serviço FFmpeg
  const response = await fetch(
    `${process.env.FFMPEG_SERVICE_URL}/status/${jobId}`
  )
  
  const status = await response.json()
  
  return NextResponse.json(status)
}
```

#### 7. Social Publisher
```
POST /api/studio/publish-video
```

**Já implementado:** ✅ Integra com YouTube, TikTok, Instagram, LinkedIn

---

## 🔐 Variáveis de Ambiente

### `.env.local` completo:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# OpenAI (Script Generator + DALL-E)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Eleven Labs (Narration)
ELEVENLABS_API_KEY=sk_xxxxxxxxxxxxx

# FFmpeg Service
FFMPEG_SERVICE_URL=https://your-lambda-or-container.com
# OU
LAMBDA_RENDER_ENDPOINT=https://xxx.execute-api.us-east-1.amazonaws.com/prod/render

# Social Media APIs (opcional)
YOUTUBE_CLIENT_ID=xxx
YOUTUBE_CLIENT_SECRET=xxx
YOUTUBE_REFRESH_TOKEN=xxx

TIKTOK_CLIENT_KEY=xxx
TIKTOK_CLIENT_SECRET=xxx

INSTAGRAM_ACCESS_TOKEN=xxx
```

---

## 🐛 Troubleshooting

### Erro: `Module not found: Can't resolve '@/lib/supabase/client'`

**Solução:** ✅ Criamos `lib/supabase/client.ts`

### Erro: `Module not found: Can't resolve 'react-dropzone'`

**Solução:** ✅ Adicionamos `react-dropzone: ^14.3.5` ao `package.json`

**Instalar:**
```bash
npm install
```

### Erro: FFmpeg timeout em Lambda

**Solução:**
```bash
# Aumentar timeout e memória
aws lambda update-function-configuration \
  --function-name video-renderer \
  --timeout 900 \
  --memory-size 3008
```

### Erro: Vídeo muito grande para renderizar

**Solução:**
- Limitar clips a 10 minutos total
- Usar qualidade 720p ao invés de 4K
- Processar em chunks menores

### Erro: Eleven Labs rate limit

**Solução:**
```typescript
// Adicionar retry com exponential backoff
async function generateNarrationWithRetry(text: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await generateNarration(text)
    } catch (error) {
      if (i === retries - 1) throw error
      await sleep(Math.pow(2, i) * 1000) // 1s, 2s, 4s
    }
  }
}
```

---

## 📊 Tabelas do Banco de Dados

```sql
-- Projetos do Media Studio
CREATE TABLE studio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- segundos
  status TEXT DEFAULT 'draft', -- draft, rendering, published
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clips de cada projeto
CREATE TABLE studio_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES studio_projects(id) ON DELETE CASCADE,
  asset_url TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- video, image, audio
  start_time DECIMAL,
  end_time DECIMAL,
  position INTEGER, -- ordem no timeline
  effects JSONB, -- array de efeitos aplicados
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assets na biblioteca
CREATE TABLE studio_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- video, audio, image
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  file_size INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Deploy Checklist

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] FFmpeg service deployado (Lambda ou Container)
- [ ] Buckets Supabase criados (`videos`, `instagram-images`)
- [ ] OpenAI API key com créditos
- [ ] Eleven Labs API key com quota
- [ ] Tabelas do banco criadas
- [ ] `npm install` executado localmente
- [ ] Build local funcionando (`npm run build`)
- [ ] APIs testadas com Postman/Thunder Client

---

## 📚 Recursos Adicionais

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [Eleven Labs Docs](https://elevenlabs.io/docs)
- [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**Última atualização:** 16 de novembro de 2025  
**Versão do Studio:** 1.0.0  
**Autor:** CatBytes Development Team
