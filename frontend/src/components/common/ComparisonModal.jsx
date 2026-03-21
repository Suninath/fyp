import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Download, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/ui/dialog";
import { Button } from "../../ui/ui/button";
import { clearComparison } from "../../rtk/slice/comparisonSlice";
import ComparisonTable from "./ComparisonTable";

const ComparisonModal = ({ isOpen, onClose, onRemove }) => {
  const dispatch = useDispatch();
  const { comparedVehicles } = useSelector((state) => state.comparison);

  const handleClearAll = () => {
    dispatch(clearComparison());
  };

  const handleDownload = () => {
    // Create a simple HTML version for printing/downloading
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vehicle Comparison</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: center; }
          th { background-color: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Vehicle Comparison Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <tr>
            <th>Specification</th>
            ${comparedVehicles.map(v => `<th>${v.name}</th>`).join("")}
          </tr>
          <tr>
            <td>Price</td>
            ${comparedVehicles.map(v => `<td>Rs. ${v.price?.toLocaleString()}</td>`).join("")}
          </tr>
          <tr>
            <td>Category</td>
            ${comparedVehicles.map(v => `<td>${v.category}</td>`).join("")}
          </tr>
          <tr>
            <td>Year</td>
            ${comparedVehicles.map(v => `<td>${v.year}</td>`).join("")}
          </tr>
          <tr>
            <td>Mileage</td>
            ${comparedVehicles.map(v => `<td>${v.mileage?.toLocaleString()} km</td>`).join("")}
          </tr>
          <tr>
            <td>Transmission</td>
            ${comparedVehicles.map(v => `<td>${v.transmission}</td>`).join("")}
          </tr>
          <tr>
            <td>Fuel Type</td>
            ${comparedVehicles.map(v => `<td>${v.fuelType}</td>`).join("")}
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vehicle-comparison.html";
    link.click();
  };

  const handleShare = () => {
    const vehicleNames = comparedVehicles.map(v => v.name).join(", ");
    const text = `Check out these vehicles: ${vehicleNames}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Vehicle Comparison",
        text: text,
      }).catch(err => console.log("Error sharing:", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert("Comparison copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Compare Vehicles {comparedVehicles.length > 0 && `(${comparedVehicles.length})`}
            </DialogTitle>
            <div className="flex gap-2">
              {comparedVehicles.length > 0 && (
                <>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                  <Button
                    onClick={handleClearAll}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <ComparisonTable vehicles={comparedVehicles} onRemove={onRemove} />
        </div>

        {comparedVehicles.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p>💡 Tip: Remove vehicles by clicking the X button on each column header to compare different vehicles.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ComparisonModal;
