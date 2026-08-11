// src/app/api/revalidate/route.js
// Endpoint chamado pelo backend após upload de novas fotos
// Força o Next.js a regenerar a página estática do álbum

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  // Verifica o segredo para evitar revalidações não autorizadas
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, error: 'Segredo inválido.' }, { status: 401 });
  }

  if (!slug) {
    return NextResponse.json({ success: false, error: 'slug é obrigatório.' }, { status: 400 });
  }

  try {
    // Revalida a página do álbum específico
    revalidatePath(`/galeria/${slug}`);
    // Também revalida a listagem de álbuns (para atualizar a capa)
    revalidatePath('/galeria');
    revalidatePath('/');

    return NextResponse.json({ success: true, revalidated: slug });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
