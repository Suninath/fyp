import React from "react";
import { AlertTriangle, Trash2, X, CheckCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/ui/dialog";
import { Button } from "../../ui/ui/button";

/**
 * Reusable Confirmation Dialog Component
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onOpenChange - Handler for dialog state changes
 * @param {function} onConfirm - Handler for confirmation action
 * @param {string} title - Dialog title
 * @param {string} description - Dialog description
 * @param {string} confirmText - Confirmation button text (default: "Confirm")
 * @param {string} variant - Button variant (default: "destructive")
 * @param {boolean} isLoading - Loading state for confirm button
 * @param {string} type - Dialog type: "danger", "warning", "info", "success" (default: "danger")
 */
const ConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
  type = "danger",
  icon: CustomIcon,
}) => {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="h-6 w-6" />;
    
    switch (type) {
      case "danger":
        return <Trash2 className="h-6 w-6 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-warning" />;
      case "success":
        return <CheckCircle className="h-6 w-6 text-success" />;
      default:
        return <Info className="h-6 w-6 text-secondary" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case "danger":
        return "bg-destructive-50 border-b border-destructive-200";
      case "warning":
        return "bg-warning-50 border-b border-warning-200";
      case "success":
        return "bg-success-50 border-b border-success-200";
      default:
        return "bg-secondary-50 border-b border-secondary-200";
    }
  };

  const getIconBgColor = () => {
    switch (type) {
      case "danger":
        return "bg-destructive-100";
      case "warning":
        return "bg-warning-100";
      case "success":
        return "bg-success-100";
      default:
        return "bg-secondary-100";
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "bg-destructive hover:bg-destructive-600";
      case "warning":
        return "bg-warning hover:bg-warning-600";
      case "success":
        return "bg-success hover:bg-success-600";
      default:
        return "bg-secondary hover:bg-secondary-600";
    }
  };

  const getConfirmIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 size={16} className="mr-2" />;
      case "warning":
        return <AlertTriangle size={16} className="mr-2" />;
      case "success":
        return <CheckCircle size={16} className="mr-2" />;
      default:
        return <Info size={16} className="mr-2" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className={`${getHeaderColor()} -m-0 p-6 rounded-t-2xl`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${getIconBgColor()}`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-gray-900">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <DialogDescription className="text-base text-gray-600 leading-relaxed">
            {description}
          </DialogDescription>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-5 hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="mr-2" />
              {cancelText}
            </Button>

            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 text-white shadow-lg transition-all ${getButtonColor()} ${
                isLoading ? "opacity-70" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  {getConfirmIcon()}
                  {confirmText}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
