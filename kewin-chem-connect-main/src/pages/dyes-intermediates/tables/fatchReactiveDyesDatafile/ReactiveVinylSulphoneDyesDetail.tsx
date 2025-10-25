import React from "react";
import DataTable from "@/components/DataTable";

const ReactiveVinylSulphoneDyesDetail = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Reactive Vinyl Sulphone Base Dyes - Product List
          </h1>
          <p className="text-muted-foreground">
            Complete catalog of Reactive Vinyl Sulphone Base Dyes with CI numbers, CAS details, and performance data.
          </p>
        </div>
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="reactivedyestable" />
      </div>
    </div>
  );
};

export default ReactiveVinylSulphoneDyesDetail;
