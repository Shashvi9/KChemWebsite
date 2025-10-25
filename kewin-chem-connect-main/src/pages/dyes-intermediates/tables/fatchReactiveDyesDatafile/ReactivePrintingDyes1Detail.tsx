import React from "react";
import DataTable from "@/components/DataTable";

const ReactivePrintingDyes1Detail = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Reactive Printing Dyes 1 - Product List
          </h1>
          <p className="text-muted-foreground">
            Discover our selection of Reactive Printing Dyes (Type 1) for advanced printing and dyeing applications.
          </p>
        </div>
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="reactivedyestable" />
      </div>
    </div>
  );
};

export default ReactivePrintingDyes1Detail;
