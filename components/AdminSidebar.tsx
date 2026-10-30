"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Cada issue do admin (usuários, endereços, pedidos) acrescenta o seu link aqui.
const LINKS = [
  { href: "/admin", label: "Painel", exact: true },
  { href: "/admin/produtos", label: "Produtos" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Administração" className="self-start overflow-hidden rounded-md border border-line bg-white">
      <ul className="flex flex-row overflow-x-auto lg:flex-col">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <li key={link.href} className="shrink-0 lg:border-b lg:border-line lg:last:border-b-0">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block px-4 py-3 transition ${active ? "bg-brand text-white" : "text-ink hover:bg-light"}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
