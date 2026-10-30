import Link from "next/link";

function Chip({ href, active, children }: Readonly<{ href: string; active: boolean; children: string }>) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        active ? "border-brand bg-brand text-white shadow-bs-sm" : "border-line bg-white text-ink hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </Link>
  );
}

// Filtro por categoria (UC04). A categoria escolhida fica na URL (/?categoria=Roupas), então dá para compartilhar o link.
export default function CategoryFilter({ categories, selected }: Readonly<{ categories: string[]; selected?: string }>) {
  return (
    <nav aria-label="Categorias" className="flex flex-wrap gap-2">
      <Chip href="/" active={!selected}>
        Todos
      </Chip>
      {categories.map((categoria) => (
        <Chip key={categoria} href={`/?categoria=${encodeURIComponent(categoria)}`} active={selected === categoria}>
          {categoria}
        </Chip>
      ))}
    </nav>
  );
}
