import { NextResponse } from "next/server";
import { failureResponse, NOT_LOGGED_IN } from "@/lib/api-result";
import { filesOf, productFields } from "@/lib/form-data";
import { productService } from "@/lib/products";
import { currentActor } from "@/lib/session";

// Fina de propósito: lê o formulário, chama o service e devolve o resultado. As regras estão no service.
export async function POST(request: Request) {
  const actor = await currentActor();
  if (!actor) return NOT_LOGGED_IN();

  const form = await request.formData();
  const result = await productService.create(actor, productFields(form), await filesOf(form, "imagens"));

  return result.ok ? NextResponse.json({ id: result.data.id }, { status: 201 }) : failureResponse(result);
}
