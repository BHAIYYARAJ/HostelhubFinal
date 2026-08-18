import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/features/recommendations/hooks/useComparison";
import ComparisonTable from "@/features/recommendations/components/ComparisonTable";

export default function ComparePage() {
  const { items } = useComparison();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="mb-6 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Compare hostels</h1>
            <p className="mt-1 text-sm text-muted-foreground">Side-by-side comparison with per-metric winners highlighted.</p>
          </div>
          <Button asChild variant="outline"><Link to="/recommendations">Back to recommendations</Link></Button>
        </div>
        <ComparisonTable items={items} />
      </main>
      <Footer />
    </div>
  );
}