import React from 'react';
// Import your custom layout if needed
// import Layout from '../../layouts/MainLayout'; 

/**
 * Interface for KPI statistics
 * Based on requirement 4.1 
 */
interface DashboardStats {
  profilesSourced: number;
  cvsAnalyzed: number;
  interviewsProcessed: number;
  activeOffers: number;
}

/**
 * Dashboard Index Page - Part 4.1 of the functional specifications 
 */
const DashboardIndex: React.FC = () => {
  
  // Mock data for display (In real scenario, fetch this using a hook)
  const stats: DashboardStats = {
    profilesSourced: 124,     // Total profiles found 
    cvsAnalyzed: 85,          // Total CVs analyzed by IA 
    interviewsProcessed: 12,  // Interviews handled 
    activeOffers: 4           // Current open positions 
  };

  return (
    <div className="p-6 bg-[#0f172a] min-h-screen text-white">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-gray-400 text-sm">Real-time KPIs and recruitment activity </p>
      </div>

      {/* 1. KPI Section - Row of 4 cards  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Profils Sourcés" value={stats.profilesSourced} icon="🔍" />
        <StatCard title="CVs Analysés" value={stats.cvsAnalyzed} icon="📄" />
        <StatCard title="Entretiens" value={stats.interviewsProcessed} icon="🎥" />
        <StatCard title="Offres en cours" value={stats.activeOffers} icon="💼" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 2. Active Briefs Section  */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Briefs Actifs</h3>
          <div className="space-y-4">
            {/* Example Brief Item */}
            <div className="flex justify-between items-center p-3 bg-[#0f172a] rounded-lg">
              <div>
                <p className="font-medium">Directeur Commercial</p>
                <p className="text-xs text-gray-500">Status: Sourcing </p>
              </div>
              <span className="bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-xs">8 Candidats</span>
            </div>
          </div>
        </div>

        {/* 3. Recent Activity Feed  */}
        <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Fil d'activité récente</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-sm">
              <span className="text-purple-500">•</span>
              <p><span className="font-bold">IA Analysis:</span> CV analysis completed for Karim Benali </p>
            </li>
            <li className="flex gap-3 text-sm">
              <span className="text-blue-500">•</span>
              <p><span className="font-bold">Sourcing:</span> 15 new profiles found on LinkedIn </p>
            </li>
          </ul>
        </div>

      </div>

      {/* 4. Top Candidates of the week  */}
      <div className="mt-8 bg-[#1e293b] p-6 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Top candidats de la semaine</h3>
        <p className="text-sm text-gray-400">Ranking based on IA scoring </p>
        {/* You can add a table here later to list the top candidates */}
      </div>
    </div>
  );
};

/**
 * Reusable Stat Card Component
 */
const StatCard: React.FC<{ title: string; value: number; icon: string }> = ({ title, value, icon }) => (
  <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
      <span className="text-2xl bg-[#0f172a] p-2 rounded-lg">{icon}</span>
    </div>
  </div>
);

export default DashboardIndex;