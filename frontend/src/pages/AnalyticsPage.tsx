import React from 'react';
import { BarChart2, TrendingUp, Clock, Target } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 font-handwritten mb-8">Performance Analytics</h1>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <StatCard title="Tests Taken" value="12" icon={<BarChart2 className="text-blue-500"/>} />
           <StatCard title="Avg Accuracy" value="68%" icon={<Target className="text-green-500"/>} />
           <StatCard title="Avg Time/Q" value="1m 45s" icon={<Clock className="text-orange-500"/>} />
           <StatCard title="Projected Rank" value="AIR 450" icon={<TrendingUp className="text-purple-500"/>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* CHART 1: SUBJECT STRENGTH */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-700 mb-6">Subject Strength Analysis</h3>
              <div className="space-y-4">
                 <ProgressBar label="Reservoir Engineering" percent={85} color="bg-green-500" />
                 <ProgressBar label="Production Engineering" percent={60} color="bg-yellow-500" />
                 <ProgressBar label="Drilling Engineering" percent={45} color="bg-red-500" />
                 <ProgressBar label="Petroleum Exploration" percent={70} color="bg-blue-500" />
                 <ProgressBar label="General Aptitude" percent={90} color="bg-green-500" />
              </div>
              <p className="mt-6 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                 <strong>Insight:</strong> Focus more on <em>Drilling Engineering</em>. Your accuracy is below 50%.
              </p>
           </div>

           {/* CHART 2: SCORE TREND */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
              <h3 className="font-bold text-gray-700 mb-4">Score Trend (Last 5 Tests)</h3>
              
              <div className="flex items-end justify-between h-48 px-4 gap-2">
                 {[45, 52, 48, 65, 72].map((score, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-full">
                       <div 
                          className="w-full bg-teal-100 border-t-4 border-teal-500 rounded-t-sm hover:bg-teal-200 transition-all relative group"
                          style={{ height: `${score}%` }}
                       >
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                             {score} Marks
                          </span>
                       </div>
                       <span className="text-xs text-gray-400 font-bold">Test {i+1}</span>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
   return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
         <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
         <div>
            <div className="text-2xl font-black text-gray-800">{value}</div>
            <div className="text-xs font-bold text-gray-400 uppercase">{title}</div>
         </div>
      </div>
   );
}

function ProgressBar({ label, percent, color }: any) {
   return (
      <div>
         <div className="flex justify-between text-sm font-bold text-gray-700 mb-1">
            <span>{label}</span>
            <span>{percent}%</span>
         </div>
         <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${percent}%` }}></div>
         </div>
      </div>
   );
}