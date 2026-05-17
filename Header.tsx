import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 shrink-0">
            <Image
              src="/vitamlogo.png"
              alt="Vitam"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Vitam</h1>
            <p className="text-xs text-gray-500">Sales Operator</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-sm text-gray-500">Operational</span>
          <span className="text-gray-300 mx-1">|</span>
          <span className="text-xs text-gray-400">All systems active</span>
        </div>
      </div>
    </header>
  );
}
