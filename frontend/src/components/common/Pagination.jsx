import React from "react";
import { Button } from "../../ui/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/ui/select";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  showPageSizeSelector = true,
  showInfo = true,
  className = "",
}) => {
  // Derive total pages if API sends 0 or undefined so controls still render for small datasets
  const derivedTotalPages = totalPages || (pageSize ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1);
  const safeCurrentPage = Math.min(currentPage || 1, derivedTotalPages);
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (derivedTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= derivedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (safeCurrentPage > 3) {
        pages.push("...");
      }
      
      // Show pages around current page
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(derivedTotalPages - 1, safeCurrentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (safeCurrentPage < derivedTotalPages - 2) {
        pages.push("...");
      }
      
      // Always show last page
      if (!pages.includes(derivedTotalPages)) {
        pages.push(derivedTotalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= derivedTotalPages && page !== safeCurrentPage) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (newSize) => {
    if (onPageSizeChange) {
      onPageSizeChange(parseInt(newSize));
    }
  };

  // Always show pagination even for small datasets; hide only when no items and no pages
  if (derivedTotalPages <= 0 && totalItems <= 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-300 ${className}`}>
      {/* Info Section */}
      {showInfo && (
        <div className="text-sm text-gray-600 order-2 sm:order-1">
          {totalItems > 0 ? (
            <>
              Showing <span className="font-semibold text-gray-900">{startItem}</span> to{" "}
              <span className="font-semibold text-gray-900">{endItem}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span> results
            </>
          ) : (
            "No results found"
          )}
        </div>
      )}

      {/* Controls Section */}
      <div className="flex items-center gap-4 order-1 sm:order-2">
        {/* Page Size Selector */}
        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">Show:</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page Navigation */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={safeCurrentPage === 1}
            className="h-9 w-9 p-0 hidden sm:flex"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="h-9 px-2 sm:px-3"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Prev</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={safeCurrentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={`h-9 w-9 p-0 ${
                    safeCurrentPage === page
                      ? "bg-primary hover:bg-primary-600 text-white"
                      : "hover:bg-primary-50 hover:text-primary"
                  }`}
                >
                  {page}
                </Button>
              )
            )}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            disabled={safeCurrentPage === derivedTotalPages}
            className="h-9 px-2 sm:px-3"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(derivedTotalPages)}
            disabled={safeCurrentPage === derivedTotalPages}
            className="h-9 w-9 p-0 hidden sm:flex"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
