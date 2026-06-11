import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Settings, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'FINISHED';
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScores, setEditingScores] = useState<Record<string, { home: string; away: string; status: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        const sortedMatches = response.data.sort((a: Match, b: Match) => 
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
      } catch (err) {
        setError('Błąd podczas pobierania meczów');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
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

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default AdminPanel;
