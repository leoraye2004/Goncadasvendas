import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Pode sobrescrever via env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME)
// antes de rodar `npm run seed`. Se não definir, troque os placeholders abaixo.
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@goncadasvendas.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "troque-esta-senha";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Usuário ADMIN criado/atualizado: ${admin.email}`);

  const categories = [
    { name: "iPhones", slug: "iphones" },
    { name: "Perfumes", slug: "perfumes" },
    { name: "Acessórios", slug: "acessorios" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log("Categorias iniciais criadas/atualizadas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
