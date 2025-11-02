export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow p-4 border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
