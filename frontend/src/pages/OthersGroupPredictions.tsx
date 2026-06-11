import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Users, ArrowLeft } from 'lucide-react';

interface PredictionEntry {
  teamName: string;
  predictedRank: number;
  pointsEarned: number | null;
}

const OthersGroupPredictions = () => {
  const [predictions, setPredictions] = useState<Record<string, Record<string, PredictionEntry[]>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllPredictions = async () => {
      try {
        const response = await api.get('/groups/all');
        setPredictions(response.data);
      } catch (err) {
        setError('Błąd podczas pobierania typów grupowych');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPredictions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-italic text-slate-400">
        Sprawdzanie co tam inni wymyślili...
      </div>
    );
  }

  const groupNames = Object.keys(predictions).sort();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Link to="/groups" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Link>
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold italic text-purple-400">Typy Grupowych Zjebów</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="space-y-12">
          {groupNames.map(groupName => (
            <div key={groupName} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <h2 className="font-black text-xl text-center uppercase">Grupa {groupName}</h2>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <div className="flex space-x-6 min-w-max pb-4">
                  {Object.entries(predictions[groupName]).map(([username, userPreds]) => (
                    <div key={username} className="bg-slate-900 rounded-lg p-4 border border-slate-700 min-w-[200px]">
                      <h3 className="text-blue-400 font-bold mb-3 border-b border-slate-800 pb-2 flex items-center justify-between">
                        {username}
                      </h3>
                      <div className="space-y-2">
                        {userPreds.sort((a, b) => a.predictedRank - b.predictedRank).map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-bold mr-3">{p.predictedRank}.</span>
                            <span className="flex-1 font-semibold">{p.teamName}</span>
                            {p.pointsEarned !== null && (
                              <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${p.pointsEarned > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-500'}`}>
                                +{p.pointsEarned}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OthersGroupPredictions;
