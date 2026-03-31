interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorSelector({ colors, selectedColor, onColorChange, disabled = false }: ColorSelectorProps) {
  if (colors.length === 0) return null;

  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'Negro': '#000000',
      'Blanco': '#ffffff',
      'Rojo': '#dc2626',
      'Azul': '#2563eb',
      'Verde': '#16a34a',
      'Amarillo': '#eab308',
      'Rosa': '#ec4899',
      'Morado': '#9333ea',
      'Gris': '#6b7280',
      'Beige': '#d4b08a',
      'Naranja': '#ea580c',
      'Turquesa': '#06b6d4',
    };
    return colorMap[colorName] || '#6b7280'; // Default to gray
  };

  return (
    <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const colorValue = getColorValue(color);
          const isSelected = selectedColor === color;

          return (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              disabled={disabled}
              className={`group relative w-10 h-10 rounded-full border-2 transition-all ${
                isSelected
                  ? 'border-pink-500 ring-2 ring-pink-200 ring-offset-1'
                  : 'border-gray-300 hover:border-gray-400'
              } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{ backgroundColor: colorValue }}
              title={color}
            >
              {colorValue === '#ffffff' && (
                <div className="absolute inset-0 rounded-full border border-gray-300"></div>
              )}
              {isSelected && (
                <div className="absolute inset-0 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selectedColor && (
        <p className="text-sm text-gray-600 mt-2">Seleccionado: {selectedColor}</p>
      )}
    </div>
  );
}