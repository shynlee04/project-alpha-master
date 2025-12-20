import React from 'react';

/**
 * A simple component to test TailwindCSS integration.
 * Uses basic Tailwind utility classes to verify styling works.
 */
export function TailwindTest() {
  return (
    <div className="p-8 max-w-md mx-auto mt-10 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        TailwindCSS 4.x Integration Test
      </h1>
      <p className="text-gray-700 mb-6">
        This component verifies that TailwindCSS is properly configured and working.
      </p>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">TW</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Utility Classes</h2>
            <p className="text-gray-600">Padding, margin, colors, shadows, etc.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded-lg border border-green-300">
            <h3 className="font-medium text-green-800">Success</h3>
            <p className="text-green-600 text-sm">Green background with border</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg border border-red-300">
            <h3 className="font-medium text-red-800">Alert</h3>
            <p className="text-red-600 text-sm">Red background with border</p>
          </div>
        </div>
        <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">
          Test Button with Gradient
        </button>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <code className="text-sm font-mono text-gray-800">
            TailwindCSS 4.x + Vite Plugin is working!
          </code>
        </div>
      </div>
    </div>
  );
}