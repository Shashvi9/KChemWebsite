// src/pages/dyes-intermediates/SolventDyes/SolventDyesDetail.tsx
import React from "react";
import DataTable from "@/components/DataTable";

const SolventDyesDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Solvent Dyes - Product List
          </h1>
          <p className="text-muted-foreground">
            Browse our complete range of Solvent Dyes with detailed technical
            specifications, CAS numbers, and product information.
          </p>
        </div>

        {/* Data Table */}
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="solvent_dyes_list" />
      </div>
    </div>
  );
};

export default SolventDyesDetail;
