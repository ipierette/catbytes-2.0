#!/usr/bin/env node

/**
 * Performance Analysis Script
 * Analisa problemas de performance do CatBytes
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🔍 ANÁLISE DE PERFORMANCE - CatBytes 2.0')
console.log('=' * 50)

// 1. Análise do Bundle Size
console.log('\n1️⃣ Análise do Bundle Size...')
try {
  const buildResult = execSync('npm run build', { encoding: 'utf8', timeout: 120000 })
  console.log('✅ Build concluído')
} catch (error) {
  console.error('❌ Erro no build:', error.message)
}

// 2. Verificar dependências pesadas
console.log('\n2️⃣ Verificando dependências pesadas...')
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const heavyDeps = [
  'framer-motion',
  '@supabase/supabase-js', 
  'openai',
  'next-intl',
  'date-fns'
]

heavyDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`📦 ${dep}: ${packageJson.dependencies[dep]}`)
  }
})

// 3. Análise de arquivos grandes
console.log('\n3️⃣ Procurando arquivos grandes...')
const checkLargeFiles = (dir, maxSize = 100000) => {
  const files = []
  const items = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...checkLargeFiles(path.join(dir, item.name), maxSize))
    } else if (item.isFile() && (item.name.endsWith('.tsx') || item.name.endsWith('.ts'))) {
      const filePath = path.join(dir, item.name)
      const stats = fs.statSync(filePath)
      if (stats.size > maxSize) {
        files.push({
          path: filePath,
          size: Math.round(stats.size / 1024),
          lines: fs.readFileSync(filePath, 'utf8').split('\n').length
        })
      }
    }
  }
  return files
}

const largeFiles = checkLargeFiles('.', 50000) // 50KB+
largeFiles
  .sort((a, b) => b.size - a.size)
  .slice(0, 10)
  .forEach(file => {
    console.log(`📄 ${file.path}: ${file.size}KB (${file.lines} linhas)`)
  })

// 4. Verificar imports duplicados
console.log('\n4️⃣ Verificando imports duplicados...')
const findDuplicateImports = (dir) => {
  const imports = {}
  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      Object.assign(imports, findDuplicateImports(path.join(dir, file.name)))
    } else if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.ts'))) {
      const filePath = path.join(dir, file.name)
      const content = fs.readFileSync(filePath, 'utf8')
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'))
      
      importLines.forEach(line => {
        const match = line.match(/from ['"](.+)['"]/)
        if (match && match[1]) {
          const importPath = match[1]
          if (!imports[importPath]) imports[importPath] = []
          imports[importPath].push(filePath)
        }
      })
    }
  }
  return imports
}

const imports = findDuplicateImports('.')
const duplicates = Object.entries(imports).filter(([, files]) => files.length > 5)
console.log(`🔄 Encontrados ${duplicates.length} imports muito utilizados:`)
duplicates.slice(0, 5).forEach(([imp, files]) => {
  console.log(`   ${imp}: ${files.length} arquivos`)
})

// 5. Verificar re-renders desnecessários
console.log('\n5️⃣ Verificando possíveis re-renders...')
const checkReRenders = (dir) => {
  const issues = []
  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  for (const file of files) {
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      issues.push(...checkReRenders(path.join(dir, file.name)))
    } else if (file.isFile() && file.name.endsWith('.tsx')) {
      const filePath = path.join(dir, file.name)
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Verificar useState sem deps
      if (content.includes('useState') && !content.includes('useMemo') && content.length > 5000) {
        issues.push(`${filePath}: Componente grande sem useMemo`)
      }
      
      // Verificar useEffect sem deps array
      const useEffectMatches = content.match(/useEffect\([^}]+\}/g)
      if (useEffectMatches) {
        useEffectMatches.forEach(match => {
          if (!match.includes(', [')) {
            issues.push(`${filePath}: useEffect sem dependency array`)
          }
        })
      }
    }
  }
  return issues
}

const rerenderIssues = checkReRenders('.')
console.log(`⚠️ Encontrados ${rerenderIssues.length} possíveis problemas de re-render`)
rerenderIssues.slice(0, 5).forEach(issue => console.log(`   ${issue}`))

console.log('\n6️⃣ RECOMENDAÇÕES:')
console.log('📈 Performance Issues Detectados:')

if (largeFiles.length > 0) {
  console.log('   - Arquivos grandes detectados - considere code splitting')
}

if (duplicates.length > 0) {
  console.log('   - Muitos imports duplicados - considere barrel exports')
}

if (rerenderIssues.length > 0) {
  console.log('   - Possíveis re-renders desnecessários detectados')
}

console.log('\n✅ Análise completa!')
console.log('🚀 Próximos passos: implementar otimizações baseadas nos achados')