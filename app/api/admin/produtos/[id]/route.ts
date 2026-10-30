import { NextResponse } from "next/server";
import { failureResponse, NOT_LOGGED_IN } from "@/lib/api-result";
import { filesOf, idsOf, productFields } from "@/lib/form-data";
import { productService } from "@/lib/products";
import { currentActor } from "@/lib/session";

type Contexto = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Readonly<Contexto>) {
  const actor = await currentActor();
  if (!actor) return NOT_LOGGED_IN();

  const { id } = await params;
  const form = await request.formData();
  const result = await productService.update(
    actor,
    id,
    productFields(form),
    await filesOf(form, "imagens"),
    idsOf(form, "removeImageIds"),
  );

  return result.ok ? NextResponse.json({ id: result.data.id }) : failureResponse(result);
}

export async function DELETE(_request: Request, { params }: Readonly<Contexto>) {
  const actor = await currentActor();
  if (!actor) return NOT_LOGGED_IN();

  const { id } = await params;
  const result = await productService.remove(actor, id);

  return result.ok ? NextResponse.json({ resultado: result.data }) : failureResponse(result);
}
