import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid } from 'recharts';
import { useMissionAnalytics } from '../hooks/useMissionAnalytics';

export function MissionAnalytics() {
  const data = useMissionAnalytics();

  const successData = [{ name: 'Success', value: data.successRate }, { name: 'Fail', value: 100 - data.successRate }];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Success Metrics */}
      <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5">
        <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4">Mission Success Rate</h4>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={successData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
              <Cell fill="#D4AF37" />
              <Cell fill="#222234" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-2xl font-black text-white">{data.successRate}%</div>
      </div>

      {/* Latency Metrics */}
      <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5">
        <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4">Task Latency (ms)</h4>
        <ResponsiveContainer width="100%" height={150}>
           <BarChart data={[{ latency: data.avgLatencyMs }]}>
             <Bar dataKey="latency" fill="#38bdf8" />
           </BarChart>
        </ResponsiveContainer>
        <div className="text-center text-2xl font-black text-white">{data.avgLatencyMs}ms</div>
      </div>

      {/* Resource Costs */}
      <div className="bg-[#11111C] border border-[#222234] rounded-2xl p-5">
        <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider mb-4">Total Tokens Used</h4>
        <div className="h-[150px] flex items-center justify-center">
            <div className="text-3xl font-black text-emerald-400 font-mono">{data.totalTokensUsed.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
