// src/pages/dyes-intermediates/DirectDyes/DirectDyesDetail.tsx
import React from "react";
import DataTable from "@/components/DataTable";

const DirectDyesDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Direct Dyes - Product List
          </h1>
          <p className="text-muted-foreground">
            Discover our wide selection of Direct Dyes with complete technical
            details, CAS numbers, and product specifications.
          </p>
        </div>

        {/* Data Table */}
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="direct_dyes_list" />
      </div>
    </div>
  );
};

export default DirectDyesDetail;
