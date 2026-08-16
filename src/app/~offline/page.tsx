"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-brand-5 text-brand-1 flex flex-col items-center justify-center p-6">
      <div className="bg-brand-4 p-8 rounded-3xl border border-brand-3/20 shadow-2xl max-w-md w-full text-center">
        <svg
          className="w-16 h-16 mx-auto mb-6 text-brand-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M9.5 5.51L12 3l2.5 2.51M17 8h.01M21 12h-2M18.36 17.64l-1.41-1.41M12 21c-4.97 0-9-4.03-9-9 0-1.66.45-3.21 1.22-4.52"
          ></path>
        </svg>
        <h1 className="text-2xl font-bold text-brand-2 mb-4">Você está Offline</h1>
        <p className="text-brand-3 mb-8">
          Mas não se preocupe! Você ainda pode acessar e editar as suas anotações salvas neste dispositivo.
        </p>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-brand-2 text-brand-5 font-bold py-3 px-4 rounded-xl hover:bg-brand-1 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
