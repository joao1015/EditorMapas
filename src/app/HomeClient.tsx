"use client";

import dynamic from "next/dynamic";

const MapEditor = dynamic(() => import("@/components/MapEditor"), { ssr: false });

export default function HomeClient() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Radar Moto - Editor de Mapas</h1>
      <MapEditor />
    </main>
  );
}
