import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, History, Users, Settings, ListChecks } from 'lucide-react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'SCHEDULED' | 'FINISHED';
}

interface Prediction {
  id: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsEarned: number | null;
}

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesRes, predictionsRes] = await Promise.all([
          api.get('/matches'),
          api.get('/predictions/me')
        ]);
        
        // Filter out matches that are finished to keep dashboard clean, 
        // or show only upcoming? Let's show all for now but sorted.
        const sortedMatches = matchesRes.data.sort((a: Match, b: Match) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        setMatches(sortedMatches);
        
        const predMap: Record<string, Prediction> = {};
        predictionsRes.data.forEach((p: Prediction) => {
          predMap[p.matchId] = p;
        });
        setPredictions(predMap);
      } catch (err) {
        setError('Błąd podczas pobierania danych');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleScoreChange = (matchId: string, side: 'home' | 'away', value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    if (success === matchId) setSuccess(null);
    
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { matchId, predictedHomeScore: 0, predictedAwayScore: 0, pointsEarned: null },
        [side === 'home' ? 'predictedHomeScore' : 'predictedAwayScore']: value === '' ? 0 : parseInt(value)
      } as Prediction
    }));
  };

  const handlePredict = async (matchId: string) => {
    const pred = predictions[matchId];
    if (!pred) return;

    setSaving(matchId);
    setError('');
    setSuccess(null);

    try {
      const response = await api.post('/predictions', {
        matchId,
        predictedHomeScore: pred.predictedHomeScore,
        predictedAwayScore: pred.predictedAwayScore
      });
      
      setPredictions(prev => ({ ...prev, [matchId]: response.data }));
      setSuccess(matchId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas zapisywania typu');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-400 text-sm">Witaj, <span className="text-blue-400 font-bold">{user?.username}</span></p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            {user?.role === 'ADMIN' && (
              <Link 
                to="/admin"
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors font-semibold text-sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                Panel Admina
              </Link>
            )}
            <Link 
              to="/groups"
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors font-semibold text-sm"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Typuj Grupy
            </Link>
            <Link 
              to="/all-predictions"
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md transition-colors font-semibold text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Typy Zjebów
            </Link>
            <Link 
              to="/my-predictions"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors font-semibold text-sm"
            >
              <History className="w-4 h-4 mr-2" />
              Moje Typy
            </Link>
            <Link 
              to="/leaderboard"
              className="flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md transition-colors font-semibold text-sm"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </Link>
            <button 
              onClick={logout}
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md transition-colors text-sm"
            >
              Wyloguj
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-4 md:p-6 shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-6 border-b border-slate-700 pb-2 flex items-center">
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded mr-2 uppercase">Mecze do obstawienia</span>
          </h2>
          
          {loading ? (
            <p className="text-center py-12 text-slate-400 italic">Przygotowywanie murawy...</p>
          ) : (
            <div className="space-y-4">
              {matches
                .filter(m => m.status === 'SCHEDULED')
                .map((match) => {
                const isMatchStarted = new Date() > new Date(match.startTime);
                const isSaving = saving === match.id;
                const isSuccess = success === match.id;
                const hasPrediction = !!predictions[match.id];
                
                return (
                  <div 
                    key={match.id} 
                    className={`p-4 md:p-6 rounded-lg border transition-all ${
                      hasPrediction 
                        ? 'bg-slate-700/80 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                        : 'bg-slate-700 border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      <div className="flex items-center">
                        <span>{new Date(match.startTime).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}</span>
                        <span className="mx-2 text-slate-600">•</span>
                        <span>{new Date(match.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex-1 text-center md:text-right w-full">
                        <span className="font-bold text-lg">{match.homeTeam}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={predictions[match.id]?.predictedHomeScore ?? ''}
                          onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                          disabled={isMatchStarted || isSaving}
                          className={`w-10 h-10 md:w-12 md:h-12 bg-slate-900 border rounded text-center text-xl font-bold focus:border-blue-500 outline-none disabled:opacity-50 ${
                            hasPrediction ? 'border-blue-500/50 text-blue-400' : 'border-slate-600'
                          }`}
                          placeholder="0"
                        />
                        <span className="text-slate-500 text-2xl font-bold">:</span>
                        <input
                          type="text"
                          value={predictions[match.id]?.predictedAwayScore ?? ''}
                          onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                          disabled={isMatchStarted || isSaving}
                          className={`w-10 h-10 md:w-12 md:h-12 bg-slate-900 border rounded text-center text-xl font-bold focus:border-blue-500 outline-none disabled:opacity-50 ${
                            hasPrediction ? 'border-blue-500/50 text-blue-400' : 'border-slate-600'
                          }`}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex-1 text-center md:text-left w-full">
                        <span className="font-bold text-lg">{match.awayTeam}</span>
                      </div>

                      <div className="w-full md:w-auto">
                        <button
                          onClick={() => handlePredict(match.id)}
                          disabled={isMatchStarted || isSaving || isSuccess}
                          className={`w-full px-6 py-2 rounded-md font-bold text-sm transition-all ${
                            isSuccess 
                              ? 'bg-green-600 text-white' 
                              : isMatchStarted 
                                ? 'bg-slate-600 text-slate-400'
                                : hasPrediction
                                  ? 'bg-slate-900 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                          }`}
                        >
                          {isSaving ? '...' : isSuccess ? 'OK!' : isMatchStarted ? 'Zablokowane' : hasPrediction ? 'Zmień' : 'Typuj'}
                        </button>
                      </div>
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

export default Dashboard;
