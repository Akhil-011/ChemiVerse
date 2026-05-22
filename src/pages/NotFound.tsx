// ============================================================
// ChemFusion AI — 404 Not Found Page
// ============================================================
import { Link } from "react-router-dom";
import { Atom, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Molecule icon */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 opacity-20 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 flex items-center justify-center">
            <Atom size={64} className="text-[#00d4ff] opacity-80 animate-spin-slow" />
          </div>
        </div>

        <h1 className="font-display font-bold text-6xl gradient-text mb-3">404</h1>
        <h2 className="font-display font-semibold text-2xl text-foreground mb-3">Molecule Not Found</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          This compound doesn't exist in our database. The reaction you're looking for may have bonded with another universe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-neon text-white flex items-center gap-2">
            <Home size={16} />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost-neon flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
