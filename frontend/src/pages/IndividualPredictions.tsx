import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, UserCircle, Target, ArrowLeft, Save, CheckCircle2, Info } from 'lucide-react';

const IndividualPredictions = () => {
  const { } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [prediction, setPrediction] = useState({
    winner: '',
    mvp: '',
    topScorer: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isDeadlinePassed = new Date() > new Date("2026-06-13T12:00:00Z");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, myPredRes] = await Promise.all([
          api.get('/groups'),
          api.get('/individual/me')
        ]);
        
        // Flatten teams from groups object
        const allTeams: any[] = [];
        Object.values(teamsRes.data).forEach((groupTeams: any) => {
          allTeams.push(...groupTeams);
        });
        setTeams(allTeams.sort((a, b) => a.name.localeCompare(b.name)));
        
        if (myPredRes.data.userId) {
          setPrediction({
            winner: myPredRes.data.winner || '',
            mvp: myPredRes.data.mvp || '',
            topScorer: myPredRes.data.topScorer || ''
          });
        }
      } catch (err) {
        setError('Błąd podczas pobierania danych');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    if (isDeadlinePassed) return;
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/individual', prediction);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas zapisywania typów');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center italic text-slate-400">Wczytywanie typów indywidualnych...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            Typy Indywidualne
          </h1>
        </div>

        {isDeadlinePassed && (
          <div className="bg-orange-500/20 border border-orange-500 text-orange-100 p-4 rounded-md mb-6 flex items-start">
            <Info className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
            <p className="text-sm">Termin obstawiania typów indywidualnych minął 13.06.2026 o 14:00. Twoje typy są teraz zablokowane.</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700 space-y-8">
          {/* Winner */}
          <div className="space-y-3">
            <label className="flex items-center text-lg font-bold text-yellow-400">
              <Trophy className="w-5 h-5 mr-2" />
              Zwycięzca Turnieju (10 pkt)
            </label>
            <select
              disabled={isDeadlinePassed}
              value={prediction.winner}
              onChange={(e) => setPrediction({...prediction, winner: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-lg font-bold focus:border-yellow-500 outline-none disabled:opacity-50"
            >
              <option value="">Wybierz drużynę...</option>
              {teams.map(t => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* MVP */}
          <div className="space-y-3">
            <label className="flex items-center text-lg font-bold text-blue-400">
              <UserCircle className="w-5 h-5 mr-2" />
              Najlepszy Zawodnik / MVP (5 pkt)
            </label>
            <input
              type="text"
              disabled={isDeadlinePassed}
              placeholder="Imię i nazwisko piłkarza..."
              value={prediction.mvp}
              onChange={(e) => setPrediction({...prediction, mvp: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-lg focus:border-blue-500 outline-none disabled:opacity-50"
            />
          </div>

          {/* Top Scorer */}
          <div className="space-y-3">
            <label className="flex items-center text-lg font-bold text-green-400">
              <Target className="w-5 h-5 mr-2" />
              Król Strzelców (5 pkt)
            </label>
            <input
              type="text"
              disabled={isDeadlinePassed}
              placeholder="Imię i nazwisko piłkarza..."
              value={prediction.topScorer}
              onChange={(e) => setPrediction({...prediction, topScorer: e.target.value})}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-lg focus:border-green-500 outline-none disabled:opacity-50"
            />
          </div>

          {!isDeadlinePassed && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-lg font-black text-xl transition-all shadow-xl flex items-center justify-center ${
                success ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
              ) : success ? (
                <CheckCircle2 className="w-6 h-6 mr-3" />
              ) : (
                <Save className="w-6 h-6 mr-3" />
              )}
              {success ? 'ZAPISANO!' : 'ZAPISZ MOJE TYPY'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualPredictions;
