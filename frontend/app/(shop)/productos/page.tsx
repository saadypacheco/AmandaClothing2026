import { Suspense } from 'react';
import { ProductosContent } from './ProductosContent';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-amanda-white pt-16">
      <div className="border-b border-amanda-lightgray px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="font-serif text-2xl md:text-3xl">Tienda</h1>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] bg-amanda-lightgray animate-pulse mb-3" />
              <div className="h-2 bg-amanda-lightgray animate-pulse w-3/4 mb-2" />
              <div className="h-2 bg-amanda-lightgray animate-pulse w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductosContent />
    </Suspense>
  );
}
