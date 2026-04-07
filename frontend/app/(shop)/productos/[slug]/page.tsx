import { Suspense } from 'react';
import { ProductoDetalle } from './ProductoDetalleContent';

interface PageProps {
  params: { slug: string };
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-amanda-white pt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
        <div className="w-full aspect-[3/4] md:aspect-auto md:h-[calc(100vh-8rem)] bg-amanda-lightgray animate-pulse" />
        <div className="flex flex-col gap-4 pt-4">
          <div className="h-3 bg-amanda-lightgray animate-pulse w-1/4" />
          <div className="h-8 bg-amanda-lightgray animate-pulse w-3/4" />
          <div className="h-6 bg-amanda-lightgray animate-pulse w-1/4" />
          <div className="h-3 bg-amanda-lightgray animate-pulse w-full mt-4" />
          <div className="h-3 bg-amanda-lightgray animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function ProductoDetallePage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductoDetalle slug={params.slug} />
    </Suspense>
  );
}
