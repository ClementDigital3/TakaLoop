export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-3 border-gray-200 border-t-green-600`} style={{borderWidth:'3px'}} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
