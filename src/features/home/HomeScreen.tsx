interface Props {
  onSelectMode: (mode: string) => void;
}

const MODES = [
  { id: 'speed', label: 'НА СКОРОСТЬ' },
  { id: 'free', label: 'СВОБОДНЫЙ РЕЖИМ' },
  { id: 'test', label: 'ИСПЫТАНИЕ' },
  { id: 'survival', label: 'ВЫЖИВАНИЕ' },
  { id: 'chain', label: 'ЦЕПОЧКА' },
  { id: 'multiplication', label: 'ТАБЛИЦА УМНОЖЕНИЯ' },
];

export function HomeScreen({ onSelectMode }: Props) {
  return (
    <div className="text-center mt-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-16 leading-tight">
        Прокачай свой <br /> устный счёт
      </h1>

      <div className="flex flex-col gap-4">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className="w-full text-center py-4 border-2 border-gray-300 rounded-xl text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-all bg-white"
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}