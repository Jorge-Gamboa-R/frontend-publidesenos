export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`${sizeClass} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`} />
    </div>
  );
}
