export default function ConfirmDialog({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all animate-in fade-in duration-200" 
      onClick={onCancel}
    >
      <div 
        className="bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm shadow-2xl relative z-10 space-y-4 antialiased" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex gap-2.5 justify-end pt-2">
          <button 
            type="button"
            onClick={onCancel} 
            className="text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-2 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="text-xs font-medium bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl px-4 py-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}