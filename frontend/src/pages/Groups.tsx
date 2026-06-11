import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { ListChecks, ArrowLeft, TrendingUp, Users } from 'lucide-react';

interface TeamStanding {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const Groups = () => {
  const [standings, setStandings] = useState<Record<string, TeamStanding[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const response = await api.get('/groups/standings');
        setStandings(response.data);
      } catch (err) {
        setError('Błąd podczas pobierania tabel grupowych');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-italic text-slate-400">
        Przeliczanie punktów w grupach...
      </div>
    );
  }

  const groupNames = Object.keys(standings).sort();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold">Tabele Grupowe</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/groups/all-predictions"
              className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-bold transition-all shadow-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              Typy innych
            </Link>
            <Link
              to="/groups/predict"
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold transition-all shadow-lg"
            >
              <ListChecks className="w-5 h-5 mr-2" />
              Obstaw grupy
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groupNames.map(groupName => (
            <div key={groupName} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-xl">
              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <h2 className="font-black text-xl text-center">GRUPA {groupName}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-2">Drużyna</th>
                      <th className="px-2 py-2 text-center">M</th>
                      <th className="px-2 py-2 text-center">B</th>
                      <th className="px-4 py-2 text-center text-white">PKT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {standings[groupName].map((team, idx) => (
                      <tr key={team.name} className={`${idx < 2 ? 'bg-blue-500/5' : ''} hover:bg-slate-700/30 transition-colors`}>
                        <td className="px-4 py-3 font-bold flex items-center">
                          <span className={`w-5 text-xs ${idx < 2 ? 'text-blue-400' : 'text-slate-500'}`}>{idx + 1}.</span>
                          {team.name}
                        </td>
                        <td className="px-2 py-3 text-center text-slate-300">{team.played}</td>
                        <td className="px-2 py-3 text-center text-slate-300">
                          {team.goalsFor}:{team.goalsAgainst}
                        </td>
                        <td className="px-4 py-3 text-center font-black text-blue-400 text-base">
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
