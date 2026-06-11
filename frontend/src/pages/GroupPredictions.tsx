import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ListChecks, ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  groupName: string;
  actualRank: number | null;
}

interface Prediction {
  id: string;
  groupName: string;
  teamName: string;
  predictedRank: number;
  pointsEarned: number | null;
}

const GroupPredictions = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Record<string, Team[]>>({});
  const [predictions, setPredictions] = useState<Record<string, number>>({}); // key: teamName, value: rank
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, predictionsRes] = await Promise.all([
          api.get('/groups'),
          api.get('/groups/me')
        ]);
        
        setGroups(groupsRes.data);
        
        const predMap: Record<string, number> = {};
        predictionsRes.data.forEach((p: Prediction) => {
          predMap[p.teamName] = p.predictedRank;
        });
        setPredictions(predMap);
      } catch (err) {
        setError('Błąd podczas pobierania danych grup');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRankChange = (teamName: string, rank: number) => {
    setPredictions(prev => ({
      ...prev,
      [teamName]: rank
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const payload = Object.entries(predictions).map(([teamName, predictedRank]) => {
        // Find which group this team belongs to
        let groupName = '';
        for (const [gName, teams] of Object.entries(groups)) {
          if (teams.some(t => t.name === teamName)) {
            groupName = gName;
            break;
          }
        }
        return { groupName, teamName, predictedRank };
      });

      await api.post('/groups', { predictions: payload });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Błąd podczas zapisywania typów');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-italic text-slate-400">
        Losowanie grup...
      </div>
    );
  }

  const groupNames = Object.keys(groups).sort();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót do meczów
          </Link>
          <div className="flex items-center">
            <ListChecks className="w-8 h-8 text-green-500 mr-3" />
            <h1 className="text-3xl font-bold">Typowanie Grup</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center px-6 py-2 rounded-md font-bold transition-all ${
              success 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
            ) : success ? (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {success ? 'Zapisano!' : 'Zapisz wszystkie typy'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupNames.map(groupName => (
            <div key={groupName} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="bg-slate-700 px-4 py-3 flex justify-between items-center">
                <h2 className="font-black text-xl">GRUPA {groupName}</h2>
                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold tracking-widest">Mistrzostwa 2026</span>
              </div>
              <div className="p-4 space-y-4">
                {groups[groupName].map(team => (
                  <div key={team.id} className="flex items-center justify-between group">
                    <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{team.name}</span>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                      {[1, 2, 3, 4].map(rank => (
                        <button
                          key={rank}
                          onClick={() => handleRankChange(team.name, rank)}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-black transition-all ${
                            predictions[team.name] === rank
                              ? 'bg-blue-600 text-white shadow-lg scale-110 z-10'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {rank}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Save Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`p-4 rounded-full shadow-2xl transition-all ${
            success ? 'bg-green-600' : 'bg-blue-600 active:scale-95'
          }`}
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : success ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : (
            <Save className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

export default GroupPredictions;
