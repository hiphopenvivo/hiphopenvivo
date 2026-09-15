import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "GET") {
    return json({ service: "hhv-continuity-worker", status: "OK", mode: "standby" });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server configuration missing" }, 500);

  const body = await req.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "status";
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (action === "status") {
    const { count, error } = await admin
      .from("hhv_jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDIENTE");
    if (error) return json({ error: error.message }, 500);
    return json({ service: "hhv-continuity-worker", status: "OK", pending: count ?? 0 });
  }

  if (action === "claim") {
    const workerId = typeof body?.worker_id === "string" && body.worker_id.trim()
      ? body.worker_id.trim()
      : "supabase-fallback";
    const requestedLimit = Number(body?.limit ?? 1);
    const limit = Math.max(1, Math.min(Number.isFinite(requestedLimit) ? requestedLimit : 1, 10));
    const { data, error } = await admin.rpc("hhv_claim_jobs", {
      p_worker_id: workerId,
      p_limit: limit,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ claimed: data ?? [] });
  }

  if (action === "requeue_stale") {
    const requestedMinutes = Number(body?.stale_minutes ?? 30);
    const staleMinutes = Math.max(1, Math.min(Number.isFinite(requestedMinutes) ? requestedMinutes : 30, 1440));
    const { data, error } = await admin.rpc("hhv_requeue_stale_jobs", {
      p_stale_minutes: staleMinutes,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ requeued: data ?? 0 });
  }

  return json({ error: "Unknown action" }, 400);
});
