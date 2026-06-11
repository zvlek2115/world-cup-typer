import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { History, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  match: Match;
}

const MyPredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyPredictions = async () => {
      try {
        // We need an endpoint that returns predictions WITH match details
        // Let's check if /predictions/me already does that or if we need to modify backend
        const response = await api.get('/predictions/me');
        setPredictions(response.data);
      } catch (err) {
        setError('Błąd podczas pobierania Twoich typów');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPredictions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Link>
          <div className="flex items-center">
            <History className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold">Moje Typy</h1>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Ładowanie Twoich typów...</div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md text-center">{error}</div>
        ) : predictions.length === 0 ? (
          <div className="bg-slate-800 p-12 rounded-lg text-center border border-slate-700 shadow-xl">
            <p className="text-slate-400 text-lg mb-6">Nie obstawiłeś jeszcze żadnego meczu.</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-bold transition-all">
              Zacznij typować
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {predictions
              .sort((a, b) => new Date(b.match.startTime).getTime() - new Date(a.match.startTime).getTime())
              .map((pred) => {
                const isFinished = pred.match.status === 'FINISHED';
                const points = pred.pointsEarned;

                return (
                  <div key={pred.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-slate-700/50 px-4 py-2 text-xs text-slate-400 flex justify-between border-b border-slate-700">
                      <span>{new Date(pred.match.startTime).toLocaleString('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className={isFinished ? 'text-slate-300' : 'text-blue-400'}>
                        {isFinished ? 'Zakończony' : 'Oczekuje'}
                      </span>
                    </div>
                    
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex-1 text-center font-bold">{pred.match.homeTeam}</div>
                      
                      <div className="flex flex-col items-center mx-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-slate-900 w-10 h-10 flex items-center justify-center rounded border border-slate-600 font-bold text-lg">
                            {pred.predictedHomeScore}
                          </div>
                          <span className="text-slate-500 font-bold">:</span>
                          <div className="bg-slate-900 w-10 h-10 flex items-center justify-center rounded border border-slate-600 font-bold text-lg">
                            {pred.predictedAwayScore}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Twój typ</div>
                      </div>

                      <div className="flex-1 text-center font-bold">{pred.match.awayTeam}</div>

                      <div className="ml-6 pl-6 border-l border-slate-700 flex flex-col items-center justify-center min-w-[80px]">
                        {isFinished ? (
                          <>
                            <div className={`text-2xl font-black ${points === 3 ? 'text-green-500' : points === 1 ? 'text-blue-400' : 'text-slate-500'}`}>
                              +{points ?? 0}
                            </div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Punktów</div>
                          </>
                        ) : (
                          <AlertCircle className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                    </div>

                    {isFinished && (
                      <div className="bg-slate-900/50 px-4 py-2 text-[10px] flex justify-center items-center space-x-2 border-t border-slate-700/50">
                        <span className="text-slate-500">Wynik meczu:</span>
                        <span className="font-bold text-slate-300">{pred.match.homeScore} : {pred.match.awayScore}</span>
                        {points === 3 ? (
                          <span className="text-green-500 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Idealnie!</span>
                        ) : points === 1 ? (
                          <span className="text-blue-400 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Trafiony wynik</span>
                        ) : (
                          <span className="text-slate-600 flex items-center"><XCircle className="w-3 h-3 mr-1" /> Pudło</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPredictions;
