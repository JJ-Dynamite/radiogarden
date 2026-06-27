'use client';

import { useState, useEffect } from 'react';

interface RadioStation {
  id: string;
  name: string;
  country: string;
  city: string;
  genre: string;
  stream_url: string;
  listeners: number;
}

export default function Home() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playing, setPlaying] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stationsRes, genresRes, statsRes] = await Promise.all([
        fetch('http://localhost:3001/api/stations'),
        fetch('http://localhost:3001/api/genres'),
        fetch('http://localhost:3001/api/stats'),
      ]);
      const stationsData = await stationsRes.json();
      const genresData = await genresRes.json();
      const statsData = await statsRes.json();
      if (stationsData.success) setStations(stationsData.data);
      if (genresData.success) setGenres(genresData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">🌍</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Radio Garden
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Listen to any global radio station - explore music worldwide</p>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-emerald-400">{(stats.total_stations / 1000).toFixed(0)}K</p>
              <p className="text-gray-400 text-sm">Stations</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.countries}</p>
              <p className="text-gray-400 text-sm">Countries</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-blue-400">{(stats.live_listeners / 1000000).toFixed(1)}M</p>
              <p className="text-gray-400 text-sm">Listeners</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.genres}</p>
              <p className="text-gray-400 text-sm">Genres</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stations..."
            className="flex-1 px-6 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setSelectedGenre('all')}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedGenre === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            All
          </button>
          {genres.map((genre, i) => (
            <button
              key={i}
              onClick={() => setSelectedGenre(genre.name)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedGenre === genre.name
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {genre.icon} {genre.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <div
              key={station.id}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border transition-all cursor-pointer hover:scale-105 ${
                playing === station.id
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
              onClick={() => setPlaying(playing === station.id ? null : station.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  {playing === station.id ? (
                    <div className="flex gap-1">
                      <div className="w-1 h-4 bg-white animate-pulse" />
                      <div className="w-1 h-6 bg-white animate-pulse delay-75" />
                      <div className="w-1 h-3 bg-white animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span className="text-2xl">▶️</span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{station.listeners.toLocaleString()} listeners</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{station.name}</h3>
              <p className="text-gray-400 text-sm">{station.city}, {station.country}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-700 rounded text-xs">{station.genre}</span>
              </div>
            </div>
          ))}
        </div>

        {playing && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 p-4">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-white animate-pulse" />
                    <div className="w-1 h-6 bg-white animate-pulse delay-75" />
                    <div className="w-1 h-3 bg-white animate-pulse delay-150" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold">{stations.find(s => s.id === playing)?.name}</p>
                  <p className="text-sm text-gray-400">Now Playing</p>
                </div>
              </div>
              <button
                onClick={() => setPlaying(null)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
