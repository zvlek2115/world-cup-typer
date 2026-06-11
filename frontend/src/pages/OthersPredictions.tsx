import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Users, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface Prediction {
  id: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsEarned: number | null;
  user: {
    username: string;
  };
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: 'SCHEDULED' | 'FINISHED';
  predictions: Prediction[];
}

const OthersPredictions = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllPredictions = async () => {
      try {
        const response = await api.get('/predictions/all');
        setMatches(response.data);
      } catch (err) {
        setError('Błąd podczas pobierania typów innych użytkowników');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPredictions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Link>
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-500 mr-3" />
            <h1 className="text-3xl font-bold italic text-purple-400">Typy Zjebów</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Podglądanie innych...</div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md text-center">{error}</div>
        ) : (
          <div className="space-y-8">
            {matches.map((match) => {
              const hasStarted = new Date() > new Date(match.startTime);
              
              return (
                <div key={match.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-xl border border-slate-700">
                  <div className="bg-slate-700/50 p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{match.homeTeam} vs {match.awayTeam}</h3>
                      <p className="text-xs text-slate-400">
                        {new Date(match.startTime).toLocaleString('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!hasStarted && (
                      <div className="flex items-center text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Przed meczem
                      </div>
                    )}
                    {hasStarted && (
                      <div className="flex items-center text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                        <Eye className="w-3 h-3 mr-1" />
                        Jawne
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {match.predictions.length === 0 ? (
                      <p className="text-slate-500 text-sm italic text-center py-4">Nikt jeszcze nie wytypował tego meczu.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {match.predictions.map((pred) => (
                          <div key={pred.id} className="bg-slate-900/50 p-3 rounded flex justify-between items-center border border-slate-700">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Użytkownik</span>
                              <span className="font-semibold text-slate-200">{pred.user.username}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Typ</span>
                              <div className="flex items-center font-black text-xl text-purple-400">
                                {!hasStarted ? (
                                  <span className="text-slate-700">?:?</span>
                                ) : (
                                  <>
                                    <span>{pred.predictedHomeScore}</span>
                                    <span className="mx-1 text-slate-600">:</span>
                                    <span>{pred.predictedAwayScore}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default OthersPredictions;
