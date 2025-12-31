/**
 * @fileoverview Minimum Viewport Warning Component
 * @module components/layout/MinViewportWarning
 *
 * Warning overlay displayed when viewport is below minimum width (1024px).
 * Moved from IDELayout.tsx for code organization.
 */

/**
 * MinViewportWarning - Shown when viewport is too small.
 *
 * Uses CSS to only display on viewports < 1024px.
 *
 * @returns Warning overlay JSX element
 */
export function MinViewportWarning(): React.JSX.Element {
    return (
        <div className="fixed inset-0 bg-background/95 z-50 hidden min-[1024px]:hidden items-center justify-center p-8 text-center max-[1023px]:flex">
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    Screen Too Small
                </h2>
                <p className="text-muted-foreground text-sm">
                    via-gent IDE requires a minimum viewport width of 1024px.
                    <br />
                    Please resize your browser window or use a larger screen.
                </p>
            </div>
        </div>
    );
}
