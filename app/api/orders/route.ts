import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type OrderItemPayload = {
  menu_item_id: string;
  qty: number;
  notes?: string;
  dining: string;
};

type OrderPayload = {
  shopId?: string;
  total?: number;
  customerName?: string;
  scheduledSlot?: string;
  note?: string | null;
  items?: OrderItemPayload[];
};

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();

  if (!supabase || !admin) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const payload = (await request.json()) as OrderPayload;

  if (!payload.shopId || !payload.total || !payload.customerName || !payload.items?.length) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  const { data, error } = await admin.rpc("fn_create_order", {
    p_user_id: user.id,
    p_shop_id: payload.shopId,
    p_total: payload.total,
    p_customer_name: payload.customerName,
    p_slot: payload.scheduledSlot ?? "ASAP",
    p_note: payload.note ?? null,
    p_items: payload.items,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const referenceNumber = data as string;

  return NextResponse.json({
    order_id: "",
    daily_code: referenceNumber.split(" ").pop() || "",
    reference_number: referenceNumber,
  });
}
