import React, { useState, useEffect } from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ children, defaultValue, value, onValueChange, className, ...props }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue)
  
  // Support controlled mode
  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      // Uncontrolled mode
      setActiveTab(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }
  
  return (
    <div className={cn("", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!child) return null
        if (child.type === TabsList || child.type === TabsContent) {
          return React.cloneElement(child, { activeTab, setActiveTab: handleTabChange })
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ className, children, activeTab, setActiveTab, ...props }) => (
  <div
    className={cn(
      "inline-flex h-12 items-center justify-center rounded-xl bg-light-bg p-1.5 text-gray-600 border border-gray-200",
      className
    )}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (!child) return null
      if (child.type === TabsTrigger) {
        return React.cloneElement(child, { activeTab, setActiveTab })
      }
      return child
    })}
  </div>
)

const TabsTrigger = ({ className, children, value, activeTab, setActiveTab, disabled, ...props }) => (
  <button
    onClick={() => !disabled && setActiveTab(value)}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value 
        ? "bg-primary text-white shadow-md" 
        : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
      className
    )}
    {...props}
  >
    {children}
  </button>
)

const TabsContent = ({ className, children, value, activeTab, setActiveTab, ...props }) => {
  if (activeTab !== value) return null
  
  return (
    <div
      className={cn(
        "mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
