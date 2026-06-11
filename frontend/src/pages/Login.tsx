import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await api.post('/auth/login', { username, password });
        login(res.data.token, res.data.user);
        navigate('/');
      } else {
        await api.post('/auth/register', { username, password });
        setIsLogin(true);
        setError('Zarejestrowano pomyślnie! Teraz możesz się zalogować.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Coś poszło nie tak');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-soccer-gold p-3 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">World Cup Typer</h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Zaloguj się do gry' : 'Utwórz nowe konto'}
          </p>
        </div>

        {error && (
          <div className={`p-3 rounded mb-4 text-sm ${error.includes('pomyślnie') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Użytkownik</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-soccer-gold"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Hasło</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-soccer-gold"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-soccer-gold hover:bg-yellow-600 text-slate-900 font-bold py-3 rounded-lg transition-colors"
          >
            {isLogin ? 'Zaloguj' : 'Zarejestruj'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-soccer-gold hover:underline text-sm"
          >
            {isLogin ? 'Nie masz konta? Zarejestruj się' : 'Masz już konto? Zaloguj się'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
