import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";

interface Props {
  categorySlug: string;
  subcategorySlug: string;
  form?: string;
}

type Product = {
  id: number;
  name: string;
  form: string | null;
  attributes: Record<string, any> | null;
};

type RowData = Record<string, string | number | null>;

const DataTable: React.FC<Props> = ({ categorySlug, subcategorySlug, form }) => {
  const [data, setData] = useState<RowData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [perPage, setPerPage] = useState("20");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          skip: ((page - 1) * parseInt(perPage)).toString(),
          limit: perPage,
          category_slug: categorySlug,
          subcategory_slug: subcategorySlug,
        });

        if (form) {
          params.append("form", form);
        }

        const response = await fetch(`http://127.0.0.1:8000/api/v1/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        const result = await response.json();

        const flattenedData = result.map((p: Product) => ({
          ID: p.id,
          Name: p.name,
          Form: p.form,
          ...p.attributes,
        }));

        setData(flattenedData);
        if (flattenedData.length > 0) {
          setColumns(Object.keys(flattenedData[0]));
          setSortKey(Object.keys(flattenedData[0])[0]);
        }
        // This is a temporary solution for total count.
        // The API should return the total count.
        setTotal(flattenedData.length);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, perPage, categorySlug, subcategorySlug, form]);

  const filtered = data.filter((item) =>
    Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey] ?? "";
    const valB = b[sortKey] ?? "";
    return (
      String(valA).localeCompare(String(valB), undefined, { numeric: true }) *
      (sortOrder === "asc" ? 1 : -1)
    );
  });

  const totalPages = Math.ceil(total / parseInt(perPage));

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (key: string) => {
    if (sortKey !== key)
      return <ArrowUpDown className="h-4 w-4 text-gray-300" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-white" />
    ) : (
      <ArrowDown className="h-4 w-4 text-white" />
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 p-3 rounded-md border border-blue-100">
        <div className="flex items-center gap-3">
          <Select
            value={perPage}
            onValueChange={(val) => {
              setPerPage(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[100px] bg-white border-gray-300">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700 font-medium">
            Total: {total}
          </span>
        </div>

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 w-full sm:w-64 border-gray-300 bg-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <Table className="min-w-full text-sm border-collapse">
          <TableHeader className="bg-blue-600 sticky top-0 z-10">
            <TableRow>
              {columns.map((key) => (
                <TableHead
                  key={key}
                  className="cursor-pointer select-none py-3 px-4 !text-white !font-bold !uppercase tracking-wide text-sm whitespace-nowrap hover:bg-blue-500 transition-colors border-x border-gray-300"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {key} {renderSortIcon(key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {sorted.map((item, i) => (
              <TableRow
                key={i}
                className={`transition-colors ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50`}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    className={`py-3 px-4 text-gray-800 border-x border-gray-200 ${
                      typeof item[col] === "number" ? "text-right" : "text-left"
                    }`}
                  >
                    {item[col] !== "" && item[col] !== null ? item[col] : "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {perPage !== "all" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-600 font-medium">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="border-gray-300"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="border-gray-300"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="border-gray-300"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="border-gray-300"
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;