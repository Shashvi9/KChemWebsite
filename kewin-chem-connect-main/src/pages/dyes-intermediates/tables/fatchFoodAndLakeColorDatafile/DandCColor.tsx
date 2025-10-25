// src/pages/dyes-intermediates/BasicDyes/DandCColorDetail.tsx
import React from "react";
import DataTable from "@/components/DataTable";

const DandCColor: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            D & C Color Basic Dyes - Product List
          </h1>
          <p className="text-muted-foreground">
            Browse our comprehensive database of D & C Color Basic Dyes with technical
            details, CAS numbers, and product information.
          </p>
        </div>

        {/* Data Table */}
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="foodandlakecolor" />
      </div>
    </div>
  );
};

export default DandCColor;
