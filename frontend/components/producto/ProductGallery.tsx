'use client';

import { useState } from 'react';

export function ProductGallery({ images, alt }: { images: string[]; alt?: string }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">Sin imágenes disponibles</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-500 text-sm">{alt ? `${alt} — imagen ${selectedImage + 1}` : `Imagen ${selectedImage + 1}`}</span>
          </div>
        </div>
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center transition-all ${
                selectedImage === index
                  ? 'ring-2 ring-pink-500 bg-pink-50'
                  : 'hover:bg-gray-300'
              }`}
            >
              <span className="text-xs text-gray-600 font-medium">{index + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}