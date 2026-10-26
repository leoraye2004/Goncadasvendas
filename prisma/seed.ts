import { PrismaClient, Role } from "@prisma/client";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Pode sobrescrever via env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME, e o mesmo
// para o cliente) antes de rodar `npm run seed`. Nenhuma senha fica no código: se não definir,
// o seed gera uma aleatória e mostra no terminal.
function senhaDoSeed(valor: string | undefined, nome: string) {
  if (valor) return valor;
  const gerada = randomBytes(12).toString("base64url");
  console.log(`${nome} não definida; senha gerada (vale só se o usuário ainda não existia): ${gerada}`);
  return gerada;
}
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@goncadasvendas.com";
const ADMIN_PASSWORD = senhaDoSeed(process.env.SEED_ADMIN_PASSWORD, "SEED_ADMIN_PASSWORD");
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";

const CUSTOMER_EMAIL = process.env.SEED_CUSTOMER_EMAIL ?? "cliente@goncadasvendas.com";
const CUSTOMER_PASSWORD = senhaDoSeed(process.env.SEED_CUSTOMER_PASSWORD, "SEED_CUSTOMER_PASSWORD");

const PRODUCTS = [
  { name: "Camiseta Básica", category: "Roupas", brand: "GV Basics", price: 49.9 },
  { name: "Calça Jeans Slim", category: "Roupas", brand: "GV Denim", price: 129.9 },
  { name: "Tênis Casual", category: "Calçados", brand: "StepUp", price: 199.9 },
  { name: "Chinelo de Dedo", category: "Calçados", brand: "Confort", price: 29.9 },
  { name: "Boné Aba Curva", category: "Acessórios", brand: "GV Basics", price: 39.9 },
  { name: "Mochila Executiva", category: "Acessórios", brand: "CarryOn", price: 149.9 },
  { name: "Jaqueta Corta-Vento", category: "Roupas", brand: "GV Outdoor", price: 179.9 },
  { name: "Relógio Digital", category: "Acessórios", brand: "TimeFit", price: 89.9 },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      cpf: "00000000000",
      birthDate: new Date("1990-01-01"),
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`Usuário ADMIN criado/atualizado: ${admin.email}`);

  const customerPasswordHash = await bcrypt.hash(CUSTOMER_PASSWORD, 10);

  const customer = await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: {},
    create: {
      name: "Cliente Exemplo",
      email: CUSTOMER_EMAIL,
      cpf: "11111111111",
      birthDate: new Date("1995-05-10"),
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
    },
  });

  console.log(`Usuário CUSTOMER criado/atualizado: ${customer.email}`);

  await Promise.all(
    PRODUCTS.map(async (product) => {
      const existing = await prisma.product.findFirst({ where: { name: product.name } });
      if (!existing) await prisma.product.create({ data: product });
    }),
  );

  console.log(`${PRODUCTS.length} produtos criados/atualizados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
