/**
 * @fileoverview Callout Block for BlockNote
 * @module presentation/components/notes/blocks/CalloutBlock
 * @story UX-09 - Toggle and Callout Blocks
 * @created 2026-01-15
 *
 * Notion-style callout blocks with icons and color variants.
 * Features:
 * - Multiple callout types (info, warning, error, success, tip)
 * - Inline content editing
 * - 8-bit design system compliance
 * - Keyboard shortcuts for creation
 */

import { useState } from "react";
import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { Info, AlertTriangle, AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import "./CalloutBlock.css";

// ============================================================================
// Types
// ============================================================================

export type CalloutType = "info" | "warning" | "error" | "success" | "tip";

// ============================================================================
// Callout Type Configuration
// ============================================================================

const CALLOUT_CONFIG: Record<CalloutType, {
    icon: typeof Info;
    label: string;
    colorClass: string;
    bgClass: string;
    borderClass: string;
}> = {
    info: {
        icon: Info,
        label: "Info",
        colorClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-50 dark:bg-blue-950/30",
        borderClass: "border-blue-200 dark:border-blue-800",
    },
    warning: {
        icon: AlertTriangle,
        label: "Warning",
        colorClass: "text-yellow-600 dark:text-yellow-400",
        bgClass: "bg-yellow-50 dark:bg-yellow-950/30",
        borderClass: "border-yellow-200 dark:border-yellow-800",
    },
    error: {
        icon: AlertCircle,
        label: "Error",
        colorClass: "text-red-600 dark:text-red-400",
        bgClass: "bg-red-50 dark:bg-red-950/30",
        borderClass: "border-red-200 dark:border-red-800",
    },
    success: {
        icon: CheckCircle,
        label: "Success",
        colorClass: "text-green-600 dark:text-green-400",
        bgClass: "bg-green-50 dark:bg-green-950/30",
        borderClass: "border-green-200 dark:border-green-800",
    },
    tip: {
        icon: Lightbulb,
        label: "Tip",
        colorClass: "text-purple-600 dark:text-purple-400",
        bgClass: "bg-purple-50 dark:bg-purple-950/30",
        borderClass: "border-purple-200 dark:border-purple-800",
    },
};

// ============================================================================
// Callout Block Component
// ============================================================================

/**
 * Renders the callout block content with type selector
 */
function CalloutBlockContent(props: {
    calloutType: CalloutType;
    onTypeChange: (type: CalloutType) => void;
    children: React.ReactNode;
}) {
    const config = CALLOUT_CONFIG[props.calloutType];
    const Icon = config.icon;

    return (
        <div
            className={cn(
                "flex gap-3 p-4 rounded-none border-2",
                config.bgClass,
                config.borderClass,
                "group relative"
            )}
        >
            {/* Icon */}
            <div className={cn("flex-shrink-0 mt-0.5", config.colorClass)}>
                <Icon className="w-5 h-5" strokeWidth={2} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {props.children}
            </div>

            {/* Type Selector - shown on hover */}
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <select
                    value={props.calloutType}
                    onChange={(e) => props.onTypeChange(e.target.value as CalloutType)}
                    className={cn(
                        "text-xs px-2 py-1 rounded-none border-2",
                        "bg-[var(--background)] border-[var(--border)]",
                        "hover:bg-[var(--accent)] cursor-pointer"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {(Object.keys(CALLOUT_CONFIG) as CalloutType[]).map((type) => (
                        <option key={type} value={type}>
                            {CALLOUT_CONFIG[type].label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

// ============================================================================
// Callout Block Spec
// ============================================================================

export const CalloutBlock = createReactBlockSpec(
    {
        type: "callout",
        propSchema: {
            calloutType: {
                default: "info" as CalloutType,
                values: ["info", "warning", "error", "success", "tip"] as CalloutType[],
            },
            textAlignment: defaultProps.textAlignment,
        },
        content: "inline",
    },
    {
        render: (props) => {
            const calloutType = props.block.props.calloutType as CalloutType;

            const handleTypeChange = (newType: CalloutType) => {
                props.editor.updateBlock(props.block, {
                    type: "callout",
                    props: { ...props.block.props, calloutType: newType },
                });
            };

            return (
                <CalloutBlockContent
                    calloutType={calloutType}
                    onTypeChange={handleTypeChange}
                >
                    {props.inlineContent}
                </CalloutBlockContent>
            );
        },
    }
);

// ============================================================================
// Helper: Create Callout Block Content for Insertion
// ============================================================================

/**
 * Creates the initial content for a new callout block
 */
export function createCalloutContent(type: CalloutType = "info") {
    return {
        type: "callout",
        props: {
            calloutType: type,
            textAlignment: "left",
        },
        content: [{
            type: "text",
            text: "",
            styles: {},
        }],
    };
}

// ============================================================================
// Helper: Get Callout Icon Component
// ============================================================================

export function getCalloutIcon(type: CalloutType): typeof Info {
    return CALLOUT_CONFIG[type]?.icon || Info;
}

export default CalloutBlock;
