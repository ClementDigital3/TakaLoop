import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-green-950 flex items-center justify-center text-white text-center px-4">
      <div>
        <div className="text-8xl font-bold font-display mb-4 text-green-400">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-green-300 mb-8">This page seems to have been recycled.</p>
        <Link to="/" className="btn-primary bg-green-400 text-green-950 hover:bg-green-300">← Back to TakaLoop</Link>
      </div>
    </div>
  );
}
