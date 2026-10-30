import type { PrismaClient } from "@prisma/client";

export type NewProduct = {
  name: string;
  category: string;
  brand?: string;
  price: number;
  imageUrls: string[];
};

export type ProductChanges = NewProduct & { removeImageIds: string[] };

const comImagens = { images: true } as const;

// Único lugar do CRUD de produtos que fala com o banco. Só busca e grava, sem regra de negócio.
export function createProductRepository(db: PrismaClient) {
  const imagens = (urls: string[]) => urls.map((url) => ({ url }));

  return {
    list: () =>
      db.product.findMany({ where: { active: true }, include: comImagens, orderBy: { name: "asc" } }),

    findById: (id: string) => db.product.findUnique({ where: { id }, include: comImagens }),

    create: ({ imageUrls, ...dados }: NewProduct) =>
      db.product.create({ data: { ...dados, images: { create: imagens(imageUrls) } }, include: comImagens }),

    update: (id: string, { imageUrls, removeImageIds, ...dados }: ProductChanges) =>
      db.product.update({
        where: { id },
        data: {
          ...dados,
          images: { create: imagens(imageUrls), deleteMany: { id: { in: removeImageIds } } },
        },
        include: comImagens,
      }),

    countOrderItems: (productId: string) => db.orderItem.count({ where: { productId } }),

    remove: (id: string) => db.product.delete({ where: { id } }),

    deactivate: (id: string) => db.product.update({ where: { id }, data: { active: false } }),
  };
}

export type ProductRepository = ReturnType<typeof createProductRepository>;
