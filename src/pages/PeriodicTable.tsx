import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { PeriodicElement } from "@/types";
import { PERIODIC_TABLE } from "@/constants/periodicTableData";
import PeriodicTableGrid from "@/components/features/PeriodicTableGrid";
import Element3DView from "@/components/features/Element3DView";
import ElementLegend from "@/components/features/ElementLegend";
import LearningFeatures from "@/components/features/LearningFeatures";
import QuizLauncher from "@/components/features/QuizLauncher";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Clock, Sparkles, ArrowRight, Database } from "lucide-react";
import { saveToStorage, loadFromStorage } from "@/lib/utils";

type ElementCategory =
  | "alkali-metals"
  | "alkaline-earth-metals"
  | "transition-metals"
  | "post-transition-metals"
  | "metalloids"
  | "nonmetals"
  | "halogens"
  | "noble-gases"
  | "lanthanides"
  | "actinides";

export default function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState<PeriodicElement | null>(null);
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | null>(null);

  const quizContext = useMemo(
    () => ({
      selectedElement,
      recentElements: recentlyViewed
        .slice(0, 8)
        .map((atomicNumber) => PERIODIC_TABLE.find((element) => element.atomicNumber === atomicNumber))
        .filter(Boolean) as PeriodicElement[],
      favoriteElements: favorites.map((atomicNumber) => PERIODIC_TABLE.find((element) => element.atomicNumber === atomicNumber)).filter(Boolean) as PeriodicElement[],
    }),
    [selectedElement, recentlyViewed, favorites]
  );

  useEffect(() => {
    const savedFavorites = loadFromStorage<number[]>("periodic_favorites", []);
    const savedRecentlyViewed = loadFromStorage<number[]>("periodic_recently_viewed", []);
    setFavorites(savedFavorites);
    setRecentlyViewed(savedRecentlyViewed);
  }, []);

  useEffect(() => {
    saveToStorage("periodic_favorites", favorites);
  }, [favorites]);

  useEffect(() => {
    saveToStorage("periodic_recently_viewed", recentlyViewed);
  }, [recentlyViewed]);

  const filteredElements = useMemo(() => PERIODIC_TABLE, []);

  const favoriteElements = useMemo(() => PERIODIC_TABLE.filter((e) => favorites.includes(e.atomicNumber)), [favorites]);

  const recentElements = useMemo(() => {
    return recentlyViewed.slice(0, 12).map((num) => PERIODIC_TABLE.find((e) => e.atomicNumber === num)).filter(Boolean) as PeriodicElement[];
  }, [recentlyViewed]);

  const handleElementClick = (element: PeriodicElement) => {
    setSelectedElement(element);
    setIs3DViewOpen(true);
    const updated = [element.atomicNumber, ...recentlyViewed.filter((num) => num !== element.atomicNumber)].slice(0, 30);
    setRecentlyViewed(updated);
  };

  const handleToggleFavorite = (element: PeriodicElement) => {
    if (favorites.includes(element.atomicNumber)) {
      setFavorites(favorites.filter((num) => num !== element.atomicNumber));
    } else {
      setFavorites([...favorites, element.atomicNumber]);
    }
  };

  const handleNextElement = () => {
    if (!selectedElement) return;
    const index = PERIODIC_TABLE.findIndex((e) => e.atomicNumber === selectedElement.atomicNumber);
    if (index < PERIODIC_TABLE.length - 1) handleElementClick(PERIODIC_TABLE[index + 1]);
  };

  const handlePrevElement = () => {
    if (!selectedElement) return;
    const index = PERIODIC_TABLE.findIndex((e) => e.atomicNumber === selectedElement.atomicNumber);
    if (index > 0) handleElementClick(PERIODIC_TABLE[index - 1]);
  };

  const handleCategorySelect = (category: ElementCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background via-background to-muted py-8 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent mb-4">Interactive Periodic Table</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Explore all 118 elements with immersive 3D atom visualization and detailed chemistry data.</p>
        </motion.div>
        <Tabs defaultValue="explore" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="explore" className="gap-2"><Sparkles className="w-4 h-4" /><span className="hidden sm:inline">Explore</span></TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2"><Heart className="w-4 h-4" /><span className="hidden sm:inline">Favorites</span>{favorites.length > 0 && <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">{favorites.length}</span>}</TabsTrigger>
            <TabsTrigger value="recent" className="gap-2"><Clock className="w-4 h-4" /><span className="hidden sm:inline">Recent</span>{recentlyViewed.length > 0 && <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-blue-500 text-white">{recentlyViewed.length}</span>}</TabsTrigger>
            <TabsTrigger value="learn" className="gap-2"><ArrowRight className="w-4 h-4" /><span className="hidden sm:inline">Learn</span></TabsTrigger>
          </TabsList>
          <TabsContent value="explore" className="space-y-8">
            <ElementLegend onCategoryClick={handleCategorySelect} selectedCategory={selectedCategory} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-foreground">Periodic Table<span className="ml-2 text-base font-normal text-muted-foreground">({filteredElements.length} elements)</span></h2>
                <QuizLauncher module="periodic-table" context={quizContext} compact />
              </div>
              <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 to-background/50 backdrop-blur-sm p-6 overflow-x-auto"><PeriodicTableGrid selectedCategory={selectedCategory} favorites={favorites} onElementClick={handleElementClick} /></div>
            </motion.div>
          </TabsContent>
          <TabsContent value="favorites" className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Your Favorite Elements{favorites.length > 0 && <span className="ml-2 text-base font-normal text-muted-foreground">({favorites.length})</span>}</h2>
              {favoriteElements.length > 0 ? <div className="rounded-xl border border-border bg-gradient-to-br from-muted/50 to-background/50 backdrop-blur-sm p-6 overflow-x-auto"><PeriodicTableGrid selectedCategory={selectedCategory} favorites={favorites} onElementClick={handleElementClick} /></div> : <div className="text-center py-12"><Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" /><p className="text-muted-foreground mb-4">You haven't added any favorite elements yet.</p><Button variant="outline" onClick={() => { const tabs = document.querySelector("[value='explore']") as HTMLElement; tabs?.click(); }}>Explore Elements</Button></div>}
            </motion.div>
          </TabsContent>
          <TabsContent value="recent" className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Recently Viewed{recentlyViewed.length > 0 && <span className="ml-2 text-base font-normal text-muted-foreground">({recentlyViewed.length})</span>}</h2>
              {recentElements.length > 0 ? <div className="space-y-4">{recentElements.map((element, idx) => <motion.button key={element.atomicNumber} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => handleElementClick(element)} className="w-full p-4 rounded-lg border border-border bg-gradient-to-r from-muted/50 to-background/50 hover:from-muted to-background/75 transition-all group"><div className="flex items-center justify-between"><div className="text-left"><div className="font-bold text-lg">{element.symbol}</div><div className="text-sm text-muted-foreground">{element.name} • Atomic #{element.atomicNumber}</div></div><div className="text-right text-sm text-muted-foreground group-hover:text-foreground transition-colors">Click to view details →</div></div></motion.button>)}</div> : <div className="text-center py-12"><Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" /><p className="text-muted-foreground">Your recently viewed elements will appear here.</p></div>}
            </motion.div>
          </TabsContent>
          <TabsContent value="learn" className="space-y-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-2xl font-bold text-foreground mb-6">Learning Features</h2>
              <LearningFeatures />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      <Element3DView element={selectedElement} isOpen={is3DViewOpen} onClose={() => setIs3DViewOpen(false)} onNext={handleNextElement} onPrev={handlePrevElement} isFavorite={selectedElement ? favorites.includes(selectedElement.atomicNumber) : false} onToggleFavorite={handleToggleFavorite} allElements={PERIODIC_TABLE} />
    </div>
  );
}
