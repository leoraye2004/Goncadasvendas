"use client";

import { useState } from "react";

// Galeria da página do produto: foto grande e miniaturas para trocar (RF11: várias imagens por produto).
export default function ProductGallery({ name, urls }: Readonly<{ name: string; urls: string[] }>) {
  const [atual, setAtual] = useState(0);

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-xl border border-line bg-light">
        {urls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element -- as imagens vêm do Blob (domínio externo)
          <img src={urls[atual]} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Sem imagem</div>
        )}
      </div>

      {urls.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {urls.map((url, indice) => (
            <li key={url}>
              <button
                type="button"
                onClick={() => setAtual(indice)}
                aria-label={`Ver foto ${indice + 1}`}
                aria-current={indice === atual}
                className={`block h-16 w-16 overflow-hidden rounded-lg border-2 bg-light ${indice === atual ? "border-brand" : "border-line"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- as imagens vêm do Blob (domínio externo) */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
