import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Trophy, ArrowLeft, Medal } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  username: string;
  totalPoints: number;
}

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setLeaderboard(response.data);
      } catch (err) {
        setError('Błąd podczas pobierania rankingu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót do typowania
          </Link>
          <div className="flex items-center">
            <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold">Ranking</h1>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-2xl border border-slate-700">
          <div className="bg-slate-700 p-4 grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-600">
            <div className="col-span-2 text-center">Poz.</div>
            <div className="col-span-7">Użytkownik</div>
            <div className="col-span-3 text-center">Punkty</div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">Ładowanie rankingu...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">{error}</div>
          ) : leaderboard.length === 0 ? (
            <div className="p-8 text-center text-slate-400">Brak danych w rankingu.</div>
          ) : (
            <div className="divide-y divide-slate-700">
              {leaderboard.map((user, index) => {
                const isTopThree = index < 3;
                const medalColor = index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-300' : 'text-orange-500';

                return (
                  <div key={user.id} className={`grid grid-cols-12 p-4 items-center ${index === 0 ? 'bg-yellow-500/5' : ''}`}>
                    <div className="col-span-2 text-center font-bold text-lg">
                      {isTopThree ? (
                        <Medal className={`w-6 h-6 mx-auto ${medalColor}`} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="col-span-7 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center mr-3 text-xs font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className={`font-semibold ${isTopThree ? 'text-white' : 'text-slate-300'}`}>
                        {user.username}
                      </span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className={`text-xl font-black ${isTopThree ? 'text-yellow-500' : 'text-blue-400'}`}>
                        {user.totalPoints}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-sm text-slate-400">
          <h3 className="font-bold text-slate-200 mb-2">Zasady punktacji:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-green-400 font-bold">3 pkt</span> - za trafienie dokładnego wyniku meczu</li>
            <li><span className="text-blue-400 font-bold">1 pkt</span> - za wytypowanie poprawnego rozstrzygnięcia (zwycięzca lub remis)</li>
            <li><span className="text-slate-500 font-bold">0 pkt</span> - w pozostałych przypadkach</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
