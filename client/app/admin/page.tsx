"use client"

import DataCharts from "./components/DataCharts"
import DataTables from "./components/DataTables"
import OverviewCards from "./components/OverviewCards"

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening today.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Live data
          </div>
        </div>

        {/* Overview stats */}
        <section>
          <OverviewCards />
        </section>

        {/* Charts */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Analytics</h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <DataCharts />
        </section>

        {/* Tables */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Data</h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <DataTables />
        </section>

      </div>
    </div>
  )
}