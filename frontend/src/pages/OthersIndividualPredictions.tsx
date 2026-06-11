import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Users, ArrowLeft, Trophy, UserCircle, Target } from 'lucide-react';

interface IndivPrediction {
  username: string;
  winner: string | null;
  mvp: string | null;
  topScorer: string | null;
  winnerPoints: number | null;
  mvpPoints: number | null;
  topScorerPoints: number | null;
}

const OthersIndividualPredictions = () => {
  const [predictions, setPredictions] = useState<IndivPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const response = await api.get('/individual/all');
        setPredictions(response.data);
      } catch (err) {
        setError('Błąd podczas pobierania typów innych osób');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center italic text-slate-400">Podglądanie planów innych...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <Link to="/individual" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Link>
          <div className="flex items-center">
            <Users className="w-8 h-8 text-orange-500 mr-3" />
            <h1 className="text-3xl font-bold italic text-orange-400 uppercase tracking-tighter">Co wymyślili inni?</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {predictions.map((p, idx) => (
            <div key={idx} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col">
              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <h2 className="font-black text-xl text-blue-400">{p.username}</h2>
              </div>
              
              <div className="p-5 space-y-6 flex-1">
                {/* Winner */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center">
                      <Trophy className="w-3 h-3 mr-1" /> Zwycięzca
                    </span>
                    {p.winnerPoints !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.winnerPoints > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-500'}`}>
                        +{p.winnerPoints}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-200">{p.winner || '---'}</p>
                </div>

                {/* MVP */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center">
                      <UserCircle className="w-3 h-3 mr-1" /> MVP
                    </span>
                    {p.mvpPoints !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.mvpPoints > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-500'}`}>
                        +{p.mvpPoints}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-200">{p.mvp || '---'}</p>
                </div>

                {/* Top Scorer */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest flex items-center">
                      <Target className="w-3 h-3 mr-1" /> Król Strzelców
                    </span>
                    {p.topScorerPoints !== null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.topScorerPoints > 0 ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-500'}`}>
                        +{p.topScorerPoints}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-slate-200">{p.topScorer || '---'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {predictions.length === 0 && (
          <div className="text-center py-20 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
            <p className="text-slate-500 font-bold italic">Nikt jeszcze nic nie wytypował. Bądź pierwszy!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OthersIndividualPredictions;
