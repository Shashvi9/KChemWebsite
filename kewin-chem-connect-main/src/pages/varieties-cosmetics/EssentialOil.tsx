import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Droplet,
  Flower,
  Leaf,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  Wind,
  TestTube,
} from "lucide-react";

const essentialOils = [
  { name: "Anti Bacterial Oil", icon: ShieldCheck, color: "from-green-500 to-green-600" },
  { name: "Antiviral Oil", icon: Wind, color: "from-red-500 to-red-600" },
  { name: "Carrier Oil", icon: Droplet, color: "from-blue-400 to-blue-600" },
  { name: "Clay & Butter Oil", icon: FlaskConical, color: "from-yellow-500 to-yellow-600" },
  { name: "Fragrance Oil", icon: Sparkles, color: "from-pink-500 to-pink-600" },
  { name: "Herbal Oil", icon: Leaf, color: "from-green-400 to-green-500" },
  { name: "Natural Essential Oil", icon: Flower, color: "from-purple-500 to-purple-600" },
  { name: "Nature Identical Oils", icon: TestTube, color: "from-indigo-500 to-indigo-600" },
  { name: "Organic Cold Pressed Oils", icon: Droplet, color: "from-teal-500 to-teal-600" },
  { name: "Organic Essential Oils", icon: Flower, color: "from-rose-500 to-rose-600" },
  { name: "Oleoresin Oil", icon: FlaskConical, color: "from-orange-500 to-orange-600" },
  { name: "Natural Flower Oil", icon: Flower, color: "from-violet-500 to-violet-600" },
];

const EssentialOil = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Essential Oils
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our premium range of Essential Oils crafted for wellness,
            aromatherapy, skincare, and holistic applications.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center max-w-6xl mx-auto">
          {essentialOils.map((item, index) => (
            <Link
              key={item.name}
              to={`/varieties-cosmetics/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-slide-up block w-full md:w-72"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Card className="border-0 shadow-card h-full w-full">
                <CardHeader className="pb-3 flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color} shadow-lg flex items-center justify-center`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    Discover premium {item.name} carefully sourced for purity,
                    wellness, and diverse applications.
                  </p>
                  <div className="inline-flex items-center text-primary font-medium text-sm">
                    View Products <span className="ml-1">›</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EssentialOil;
