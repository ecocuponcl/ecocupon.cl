/**
 * SmarterOS MCP Server para Ecocupon.cl
 * 
 * Herramientas disponibles:
 * - validar_qr: Valida un código QR de usuario
 * - consultar_saldo: Consulta el saldo de puntos de un usuario
 * - registrar_reciclaje: Registra una transacción de reciclaje
 * - emitir_cupon: Emite un nuevo cupón de descuento
 * 
 * Sin JWT - Comunicación directa en VPS controlado
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";

// Configuración desde variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL || "https://uyxvzztnsvfcqmgkrnol.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error("ERROR: SUPABASE_KEY no configurada. Setea SUPABASE_KEY o SUPABASE_ANON_KEY");
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Crear servidor MCP
const server = new McpServer({
  name: "smarteros-mcp",
  version: "1.0.0",
  description: "MCP Server para Ecocupon.cl - Gestión de QR, Saldo, Reciclaje y Cupones"
});

/**
 * Herramienta: validar_qr
 * Valida un código QR de usuario y retorna la información del usuario
 */
server.tool(
  "validar_qr",
  "Valida un código QR de usuario y retorna la información del usuario asociado",
  {
    qr_code: { type: "string", description: "El código QR a validar" }
  },
  async ({ qr_code }) => {
    try {
      // Buscar usuario por QR code
      const { data, error } = await supabase
        .from("users")
        .select("id, email, full_name, points, created_at")
        .eq("qr_code", qr_code)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                valid: false,
                message: "QR no encontrado o inválido",
                qr_code
              })
            }]
          };
        }
        throw error;
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: true,
            message: "QR válido",
            user: {
              id: data.id,
              email: data.email,
              full_name: data.full_name,
              points: data.points
            }
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: false,
            message: "Error al validar QR",
            error: error.message
          })
        }]
      };
    }
  }
);

/**
 * Herramienta: consultar_saldo
 * Consulta el saldo de puntos de un usuario
 */
server.tool(
  "consultar_saldo",
  "Consulta el saldo de puntos de un usuario por su ID o email",
  {
    user_identifier: { type: "string", description: "ID del usuario o email" },
    identifier_type: { type: "string", description: "Tipo de identificador: 'id' o 'email'", enum: ["id", "email"] }
  },
  async ({ user_identifier, identifier_type }) => {
    try {
      const query = identifier_type === "id"
        ? supabase.from("users").select("id, email, full_name, points, updated_at").eq("id", user_identifier)
        : supabase.from("users").select("id, email, full_name, points, updated_at").eq("email", user_identifier);

      const { data, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: false,
                message: "Usuario no encontrado",
                identifier: user_identifier
              })
            }]
          };
        }
        throw error;
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            user: {
              id: data.id,
              email: data.email,
              full_name: data.full_name
            },
            saldo: {
              points: data.points,
              updated_at: data.updated_at
            }
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: "Error al consultar saldo",
            error: error.message
          })
        }]
      };
    }
  }
);

/**
 * Herramienta: registrar_reciclaje
 * Registra una transacción de reciclaje y suma puntos al usuario
 */
server.tool(
  "registrar_reciclaje",
  "Registra una transacción de reciclaje y suma puntos al usuario",
  {
    user_id: { type: "string", description: "ID del usuario" },
    material_type: { type: "string", description: "Tipo de material: plastico, vidrio, papel, aluminio, organico" },
    weight_kg: { type: "number", description: "Peso en kilogramos" },
    points_to_add: { type: "number", description: "Puntos a sumar (opcional, se calcula si no se proporciona)" }
  },
  async ({ user_id, material_type, weight_kg, points_to_add }) => {
    try {
      // Calcular puntos si no se proporcionan (10 puntos por kg por defecto)
      const points = points_to_add ?? Math.round(weight_kg * 10);

      // Registrar transacción de reciclaje
      const { data: transaction, error: transactionError } = await supabase
        .from("recycling_transactions")
        .insert({
          user_id,
          material_type,
          weight_kg,
          points_earned: points
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Actualizar saldo del usuario
      const { error: updateError } = await supabase.rpc("increment_user_points", {
        user_id,
        points_to_add: points
      });

      // Si no existe la función RPC, actualizar directamente
      if (updateError && updateError.code === "42883") {
        await supabase
          .from("users")
          .update({ points: supabase.raw(`points + ${points}`) })
          .eq("id", user_id);
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Reciclaje registrado exitosamente",
            transaction: {
              id: transaction.id,
              material_type: transaction.material_type,
              weight_kg: transaction.weight_kg,
              points_earned: points
            }
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: "Error al registrar reciclaje",
            error: error.message
          })
        }]
      };
    }
  }
);

/**
 * Herramienta: emitir_cupon
 * Emite un nuevo cupón de descuento para un usuario
 */
server.tool(
  "emitir_cupon",
  "Emite un nuevo cupón de descuento para un usuario",
  {
    user_id: { type: "string", description: "ID del usuario" },
    coupon_type: { type: "string", description: "Tipo de cupón: descuento_porcentaje, descuento_fijo, envio_gratis" },
    value: { type: "number", description: "Valor del cupón (porcentaje o monto fijo)" },
    min_purchase: { type: "number", description: "Compra mínima requerida (opcional)" },
    expires_in_days: { type: "number", description: "Días de validez (default: 30)" }
  },
  async ({ user_id, coupon_type, value, min_purchase, expires_in_days }) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (expires_in_days || 30));

      // Generar código único
      const couponCode = `ECO-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Insertar cupón
      const { data: coupon, error } = await supabase
        .from("coupons")
        .insert({
          user_id,
          code: couponCode,
          type: coupon_type,
          value,
          min_purchase: min_purchase || 0,
          expires_at: expiresAt.toISOString(),
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            message: "Cupón emitido exitosamente",
            coupon: {
              id: coupon.id,
              code: coupon.code,
              type: coupon.type,
              value: coupon.value,
              min_purchase: coupon.min_purchase,
              expires_at: coupon.expires_at
            }
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: "Error al emitir cupón",
            error: error.message
          })
        }]
      };
    }
  }
);

/**
 * Herramienta: listar_cupones_activos
 * Lista los cupones activos de un usuario
 */
server.tool(
  "listar_cupones_activos",
  "Lista los cupones activos de un usuario",
  {
    user_id: { type: "string", description: "ID del usuario" }
  },
  async ({ user_id }) => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, type, value, min_purchase, expires_at, created_at")
        .eq("user_id", user_id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true });

      if (error) throw error;

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: true,
            count: data?.length || 0,
            coupons: data || []
          })
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            success: false,
            message: "Error al listar cupones",
            error: error.message
          })
        }]
      };
    }
  }
);

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SmarterOS MCP Server corriendo en VPS...");
  console.error("Herramientas disponibles: validar_qr, consultar_saldo, registrar_reciclaje, emitir_cupon, listar_cupones_activos");
}

main().catch(console.error);
