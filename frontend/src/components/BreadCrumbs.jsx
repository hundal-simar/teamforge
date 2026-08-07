import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-xs text-zinc-400 mb-4 antialiased">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && (
            <span className="text-zinc-600 select-none px-0.5" aria-hidden="true">
              /
            </span>
          )}
          {i === items.length - 1 ? (
            <span className="text-zinc-100 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.to}
              className="text-zinc-400 hover:text-indigo-400 font-medium transition-colors duration-150 truncate max-w-[150px] sm:max-w-xs"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}