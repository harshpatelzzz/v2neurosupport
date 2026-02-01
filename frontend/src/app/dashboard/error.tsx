'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 dark:border-red-800 dark:bg-red-900/20">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">
        Something went wrong
      </h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-400">{error.message}</p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-red-600 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
