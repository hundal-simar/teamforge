import { Link } from 'react-router-dom';


export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-sm text-gray-500 mb-4">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1.5 text-gray-300">/</span>}
          {i === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link to={item.to} className="hover:text-indigo-600 hover:underline">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}