import React from "react";
import { useParams } from "react-router-dom";
import DataTable from "@/components/DataTable";

const DyeDetail: React.FC = () => {
  const { form } = useParams<{ form: string }>();

  // Convert slug to title case for display
  const title = form
    ? form
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {title} - Product List
          </h1>
          <p className="text-muted-foreground">
            Browse our comprehensive database of {title} with technical
            details, CAS numbers, and product information.
          </p>
        </div>

        {/* Data Table */}
        {form && <DataTable categorySlug="dyes-intermediates" subcategorySlug="aciddyes" form={title} />}

      </div>
    </div>
  );
};

export default DyeDetail;
