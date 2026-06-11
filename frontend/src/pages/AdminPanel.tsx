import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Settings, ArrowLeft, Save, CheckCircle2, ListChecks } from 'lucide-react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'FINISHED';
}

interface Team {
  id: string;
  name: string;
  groupName: string;
  actualRank: number | null;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Record<string, Team[]>>({});
  const [loading, setLoading] = useState(true);
  const [editingScores, setEditingScores] = useState<Record<string, { home: string; away: string; status: string }>>({});
  const [groupResults, setGroupResults] = useState<Record<string, Record<string, string>>>({}); // groupName -> {teamName: rank}
  const [saving, setSaving] = useState<string | null>(null);
  const [savingGroup, setSavingGroup] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matches' | 'groups'>('matches');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, groupsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/groups')
        ]);

        const sortedMatches = matchesRes.data.sort((a: Match, b: Match) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        setMatches(sortedMatches);
        
        const initialScores: Record<string, { home: string; away: string; status: string }> = {};
        sortedMatches.forEach((m: Match) => {
          initialScores[m.id] = {
            home: m.homeScore?.toString() || '',
            away: m.awayScore?.toString() || '',
            status: m.status
          };
        });
        setEditingScores(initialScores);

        setGroups(groupsRes.data);
        const initialGroupResults: Record<string, Record<string, string>> = {};
        Object.entries(groupsRes.data as Record<string, Team[]>).forEach(([gName, teams]) => {
          initialGroupResults[gName] = {};
          teams.forEach(t => {
            initialGroupResults[gName][t.name] = t.actualRank?.toString() || '';
          });
        });
        setGroupResults(initialGroupResults);

      } catch (err) {
        setError('Błąd podczas pobierania danych');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  const handleScoreChange = (matchId: string, side: 'home' | 'away' | 'status', value: string) => {
    setEditingScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [side]: value
      }
    }));
  };

  const handleGroupResultChange = (groupName: string, teamName: string, rank: string) => {
    setGroupResults(prev => ({
      ...prev,
      [groupName]: {
        ...prev[groupName],
        [teamName]: rank
      }
    }));
  };

  const handleUpdateResult = async (matchId: string) => {
    const edit = editingScores[matchId];
    setSaving(matchId);
    setError('');
    setSuccess(null);

    try {
      await api.put(`/matches/${matchId}`, {
        homeScore: edit.home === '' ? null : parseInt(edit.home),
        awayScore: edit.away === '' ? null : parseInt(edit.away),
        status: edit.status
      });
      setSuccess(matchId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas aktualizacji wyniku');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdateGroupResult = async (groupName: string) => {
    const results = groupResults[groupName];
    setSavingGroup(groupName);
    setError('');
    setSuccess(null);

    try {
      const formattedResults: Record<string, number> = {};
      for (const team in results) {
        if (results[team] !== '') {
          formattedResults[team] = parseInt(results[team]);
        }
      }

      await api.put('/groups/result', { groupName, results: formattedResults });
      setSuccess(`group-${groupName}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas aktualizacji grupy');
    } finally {
      setSavingGroup(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Link>
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold">Panel Admina</h1>
          </div>
        </div>

        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-2 rounded-md font-bold transition-all ${
              activeTab === 'matches' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Mecze
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-md font-bold transition-all ${
              activeTab === 'groups' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Grupy
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {activeTab === 'matches' ? (
          <div className="bg-slate-800 rounded-lg shadow-xl overflow-hidden border border-slate-700">
            <div className="bg-slate-700 p-4 grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-600">
              <div className="col-span-3">Data i Godzina</div>
              <div className="col-span-4 text-center">Mecz</div>
              <div className="col-span-2 text-center">Wynik</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-1 text-right">Akcja</div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 italic">Wczytywanie listy meczów...</div>
            ) : (
              <div className="divide-y divide-slate-700">
                {matches.map((match) => {
                  const isSaving = saving === match.id;
                  const isSuccess = success === match.id;
                  
                  return (
                    <div key={match.id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-700/30 transition-colors">
                      <div className="col-span-3 flex flex-col">
                        <span className="font-semibold text-slate-200">
                          {new Date(match.startTime).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(match.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="col-span-4 flex items-center justify-between px-4">
                        <span className="flex-1 text-right font-bold text-sm">{match.homeTeam}</span>
                        <span className="mx-2 text-slate-600">-</span>
                        <span className="flex-1 text-left font-bold text-sm">{match.awayTeam}</span>
                      </div>

                      <div className="col-span-2 flex items-center justify-center space-x-2">
                        <input
                          type="text"
                          value={editingScores[match.id]?.home || ''}
                          onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                          className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-bold focus:border-red-500 outline-none text-sm"
                          placeholder="?"
                        />
                        <span className="text-slate-500">:</span>
                        <input
                          type="text"
                          value={editingScores[match.id]?.away || ''}
                          onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                          className="w-10 h-10 bg-slate-900 border border-slate-600 rounded text-center font-bold focus:border-red-500 outline-none text-sm"
                          placeholder="?"
                        />
                      </div>

                      <div className="col-span-2 px-2">
                        <select
                          value={editingScores[match.id]?.status}
                          onChange={(e) => handleScoreChange(match.id, 'status', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-2 text-xs font-bold focus:border-red-500 outline-none"
                        >
                          <option value="SCHEDULED">Zaplanowany</option>
                          <option value="FINISHED">Zakończony</option>
                        </select>
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          onClick={() => handleUpdateResult(match.id)}
                          disabled={isSaving}
                          className={`p-2 rounded-md transition-all ${
                            isSuccess 
                              ? 'bg-green-600 text-white' 
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                          title="Zapisz wynik i rozlicz punkty"
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : isSuccess ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(groups).sort().map((gName) => {
              const isSaving = savingGroup === gName;
              const isSuccess = success === `group-${gName}`;
              
              return (
                <div key={gName} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden shadow-lg">
                  <div className="bg-slate-700 p-3 flex justify-between items-center">
                    <h3 className="font-bold flex items-center">
                      <ListChecks className="w-4 h-4 mr-2 text-red-500" />
                      GRUPA {gName}
                    </h3>
                    <button
                      onClick={() => handleUpdateGroupResult(gName)}
                      disabled={isSaving}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        isSuccess ? 'bg-green-600' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {isSaving ? 'Zapisywanie...' : isSuccess ? 'Zapisano!' : 'Zapisz Wynik Grupy'}
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {groups[gName].map((team) => (
                      <div key={team.id} className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{team.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-500 uppercase font-bold">Miejsce:</span>
                          <select
                            value={groupResults[gName]?.[team.name] || ''}
                            onChange={(e) => handleGroupResultChange(gName, team.name, e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs font-bold focus:border-red-500 outline-none w-16"
                          >
                            <option value="">?</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
