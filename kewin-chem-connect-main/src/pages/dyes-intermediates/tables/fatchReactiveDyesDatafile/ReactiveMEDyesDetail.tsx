import React from "react";
import DataTable from "@/components/DataTable";

const ReactiveMEDyesDetail = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Reactive ME Dyes - Product List
          </h1>
          <p className="text-muted-foreground">
            Detailed product listing of Reactive ME Dyes with CI numbers, CAS references, and application information.
          </p>
        </div>
        <DataTable categorySlug="dyes-intermediates" subcategorySlug="reactivedyes" />
      </div>
    </div>
  );
};

export default ReactiveMEDyesDetail;
