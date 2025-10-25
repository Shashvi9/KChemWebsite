// src/pages/dyes-intermediates/Intermediates/IntermediatesDetail.tsx
import React from "react";
import DataTable from "@/components/DataTable";

const IntermediatesDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Intermediates - Product List
          </h1>
          <p className="text-muted-foreground">
            Explore our extensive range of Intermediates with complete technical
            specifications, CAS numbers, and detailed product information.
          </p>
        </div>

        {/* Data Table */}
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="intermediates_list" />
      </div>
    </div>
  );
};

export default IntermediatesDetail;
