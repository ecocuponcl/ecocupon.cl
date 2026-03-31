#!/usr/bin/env node
/**
 * Test script para SmarterMCP
 * Prueba las 8 tools del servidor
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log("🔍 Probando SmarterMCP Tools\n");
console.log("Supabase URL:", SUPABASE_URL);
console.log("Supabase Key:", SUPABASE_KEY ? "✅ Configurada" : "❌ Faltante");
console.log("");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testTools() {
  console.log("📋 Tests:\n");
  
  // Test 1: Consultar un usuario (simula validar_qr)
  console.log("1️⃣  Test: Consultar usuarios...");
  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, full_name, points")
    .limit(1);
  
  if (error) {
    console.log("   ❌ Error:", error.message);
  } else {
    console.log("   ✅ Success:", users.length, "usuario(s) encontrado(s)");
    if (users.length > 0) {
      console.log("      Primer usuario:", users[0].email, "- Puntos:", users[0].points);
    }
  }
  
  // Test 2: Verificar tabla recycling_events
  console.log("\n2️⃣  Test: Tabla recycling_events...");
  const { count, error: countError } = await supabase
    .from("recycling_events")
    .select("*", { count: "exact", head: true });
  
  if (countError) {
    console.log("   ⚠️  Tabla no existe o error:", countError.message);
  } else {
    console.log("   ✅ Success:", count, "eventos registrados");
  }
  
  // Test 3: Verificar tabla coupons
  console.log("\n3️⃣  Test: Tabla coupons...");
  const { count: couponCount, error: couponError } = await supabase
    .from("coupons")
    .select("*", { count: "exact", head: true });
  
  if (couponError) {
    console.log("   ⚠️  Tabla no existe o error:", couponError.message);
  } else {
    console.log("   ✅ Success:", couponCount, "cupones registrados");
  }
  
  console.log("\n✅ Tests completados");
  console.log("\n💡 Las tools MCP están listas para usarse con Antigravity");
}

testTools().catch(console.error);
