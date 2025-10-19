// src/app/api/geo/route.js
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ip-api é HTTP (sem TLS). Server-side não sofre bloqueio de mixed content.
    const url = "http://ip-api.com/json/?fields=status,message,city,regionName&lang=pt-BR";
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (data?.status !== "success") {
      return NextResponse.json(
        { city: "sua cidade", regionName: "", ok: false, error: data?.message || "geo_failed" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { city: data.city || "sua cidade", regionName: data.regionName || "", ok: true },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { city: "sua cidade", regionName: "", ok: false, error: "geo_exception" },
      { status: 200 }
    );
  }
}
