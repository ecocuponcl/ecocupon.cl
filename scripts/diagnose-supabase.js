#!/usr/bin/env node
/**
 * Script de diagnóstico para verificar conexión con Supabase
 * 
 * Uso: node scripts/diagnose-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
const envPath = join(__dirname, '..', '.env.local')
console.log('📄 Leyendo variables de entorno desde:', envPath)

try {
  const envContent = readFileSync(envPath, 'utf-8')
  const lines = envContent.split('\n')
  
  for (const line of lines) {
    const [key, value] = line.split('=')
    if (key && value && key.includes('SUPABASE')) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
    }
  }
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message)
  console.log('Asegúrate de que el archivo existe y tiene las variables de Supabase')
  process.exit(1)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 Diagnóstico de Supabase\n')
console.log('═'.repeat(50))

// Verificar variables
console.log('\n1️⃣ Variables de entorno:')
console.log('   URL:', supabaseUrl || '❌ NO CONFIGURADA')
console.log('   Anon Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ NO CONFIGURADA')

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Faltan variables de entorno. Verifica tu .env.local')
  process.exit(1)
}

// Crear cliente
console.log('\n2️⃣ Creando cliente de Supabase...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test de conexión
console.log('\n3️⃣ Probando conexión...')

try {
  const { data, error } = await supabase.from('_').select('*').limit(1)
  
  if (error) {
    console.log('   ⚠️ Error en consulta:', error.message)
    console.log('   💡 Hint:', error.hint || 'Verifica las API keys en Supabase Dashboard')
  } else {
    console.log('   ✅ Conexión exitosa')
  }
} catch (error) {
  console.log('   ❌ Error:', error.message)
}

// Test de auth
console.log('\n4️⃣ Probando autenticación...')

try {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.log('   ⚠️ No hay sesión activa (normal):', error.message)
  } else if (user) {
    console.log('   ✅ Usuario autenticado:', user.email)
  }
} catch (error) {
  console.log('   ❌ Error:', error.message)
}

// Resumen
console.log('\n═'.repeat(50))
console.log('\n📋 Resumen:')
console.log('   Project Ref:', supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'Desconocido')
console.log('   URL:', supabaseUrl)
console.log('   Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltante')

console.log('\n🔗 Links útiles:')
console.log('   Dashboard: https://supabase.com/dashboard/project/' + (supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || ''))
console.log('   API Settings: https://supabase.com/dashboard/project/' + (supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '') + '/settings/api')
console.log('   Auth Providers: https://supabase.com/dashboard/project/' + (supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || '') + '/auth/providers')

console.log('\n✅ Diagnóstico completado\n')
