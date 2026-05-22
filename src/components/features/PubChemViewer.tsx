// ============================================================
// ChemVerse — Interactive 3D Molecule Viewer with 3Dmol.js
// Fetches molecule structures from PubChem PUG REST API
// Supports rotate/zoom/spin with ball-and-stick visualization
// ============================================================

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, RotateCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { modalVariants, transcriptVariants } from "@/lib/animationVariants";
import { modalTransition } from "@/lib/motionPresets";

interface PubChemViewerProps {
  moleculeName: string;
  height?: string;
  autoSpin?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
  onError?: (error: string | null) => void;
}

export default function PubChemViewer({
  moleculeName,
  height = "500px",
  autoSpin = true,
  onLoadingChange,
  onError,
}: PubChemViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize 3Dmol viewer
    const initializeViewer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`[PubChemViewer] Loading molecule: ${moleculeName}`);

        // Dynamically import 3Dmol
        let $3Dmol;
        try {
          const imported = await import("3dmol");
          // Try different export patterns
          $3Dmol = imported.default || imported.$3Dmol || imported;
          console.log("[PubChemViewer] 3Dmol imported successfully");
        } catch (importErr) {
          console.error("[PubChemViewer] Import error:", importErr);
          throw new Error("Failed to load 3Dmol library");
        }

        // Check if createViewer exists
        if (!$3Dmol || typeof $3Dmol.createViewer !== "function") {
          console.error("[PubChemViewer] 3Dmol object:", $3Dmol);
          throw new Error("3Dmol library not properly loaded - createViewer not found");
        }
        
        // Only create viewer once
        if (!isInitializedRef.current && containerRef.current) {
          console.log("[PubChemViewer] Creating 3Dmol viewer...");
          const viewer = $3Dmol.createViewer(containerRef.current, {
            backgroundColor: "rgba(0,0,0,0)",
            antialias: true,
          });
          viewerRef.current = viewer;
          isInitializedRef.current = true;
          console.log("[PubChemViewer] Viewer created successfully");
        }

        if (!viewerRef.current) {
          throw new Error("Failed to create 3Dmol viewer");
        }

        // Clear previous models
        viewerRef.current.removeAllModels();

        // Fetch SDF data from PubChem
        const pubchemUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(
          moleculeName
        )}/SDF?record_type=3d`;

        console.log(`[PubChemViewer] Fetching from: ${pubchemUrl}`);
        const response = await fetch(pubchemUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch molecule data for "${moleculeName}" (${response.status})`);
        }

        const sdfData = await response.text();
        if (!sdfData || sdfData.length === 0) {
          throw new Error(`No 3D structure data found for "${moleculeName}"`);
        }

        console.log("[PubChemViewer] Adding model to viewer...");
        // Load SDF data into viewer
        viewerRef.current.addModel(sdfData, "sdf");

        // Set visualization style - ball and stick
        viewerRef.current.setStyle({}, { 
          stick: { 
            colorscheme: "Jmol",
            thickness: 0.15,
          },
          sphere: { 
            scale: 0.35,
            colorscheme: "Jmol",
            opacity: 0.9,
          }
        });

        // Zoom to fit
        viewerRef.current.zoomTo();

        // Enable auto-spin if requested
        if (autoSpin) {
          viewerRef.current.spin(true);
        }

        // Render
        console.log("[PubChemViewer] Rendering viewer...");
        viewerRef.current.render();

        setIsLoading(false);
        onLoadingChange?.(false);
        console.log("[PubChemViewer] Viewer ready!");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load molecule";
        console.error("[PubChemViewer] Error:", errorMessage, err);
        setError(errorMessage);
        setIsLoading(false);
        onError?.(errorMessage);
        onLoadingChange?.(false);
      }
    };

    initializeViewer();

    // Cleanup
    return () => {
      // Don't destroy the viewer on unmount, just clear models
      if (viewerRef.current) {
        try {
          viewerRef.current.removeAllModels();
          viewerRef.current.spin(false);
        } catch (e) {
          console.warn("[PubChemViewer] Cleanup error:", e);
        }
      }
    };
  }, [moleculeName, autoSpin, onLoadingChange, onError]);

  // Toggle spin
  const toggleSpin = () => {
    if (viewerRef.current) {
      try {
        const isSpinning = viewerRef.current.spin();
        viewerRef.current.spin(!isSpinning);
        viewerRef.current.render();
      } catch (e) {
        console.error("[PubChemViewer] Toggle spin error:", e);
      }
    }
  };

  // Reset view
  const resetView = () => {
    if (viewerRef.current) {
      try {
        viewerRef.current.zoomTo();
        viewerRef.current.render();
      } catch (e) {
        console.error("[PubChemViewer] Reset view error:", e);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header with controls */}
      <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-900/30 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-100">{moleculeName}</h3>
        <div className="flex gap-2">
          <motion.button
            onClick={toggleSpin}
            whileTap={{ scale: 0.96 }}
            className="p-1.5 rounded-md hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
            title="Toggle auto-spin"
          >
            <RotateCw size={16} />
          </motion.button>
          <motion.button
            onClick={resetView}
            whileTap={{ scale: 0.96 }}
            className="p-1.5 rounded-md hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
            title="Reset view"
          >
            <svg
              size="16"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Viewer container */}
      <div
        ref={containerRef}
        style={{ height, width: "100%" }}
        className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950"
      >
        {/* Loading spinner */}
        <AnimatePresence>
        {isLoading && (
          <motion.div
            key="viewer-loading"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-20"
          >
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}>
                <Loader2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-slate-300">Loading {moleculeName}...</p>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <motion.div
            key="viewer-error"
            variants={transcriptVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={modalTransition}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm z-20 p-4"
          >
            <Alert className="bg-red-950/50 border-red-700/50 w-full">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-200 text-sm mt-2">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Controls hint */}
      <div className="text-xs text-slate-500 px-2">
        💡 Scroll to zoom • Drag to rotate • Right-click to pan
      </div>
    </div>
  );
}
