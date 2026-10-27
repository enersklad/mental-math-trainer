import { useState, useEffect } from 'react';
import { Header } from './shared/ui/Header';
import { HomeScreen } from './features/home/HomeScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { TrainerScreen } from './features/trainer/TrainerScreen';
import { ResultScreen } from './features/stats/ResultScreen';
import { StatsScreen } from './features/stats/StatsScreen';
import { storageService } from './shared/storage/storageService';
import type { UserProgress } from './shared/storage/storageService';
import type { TaskConfig, SessionResult } from './features/trainer/types';
import { shouldLevelUp, getNextLevelConfig } from './features/trainer/levelLogic';
import { SpeedSettingsScreen } from './features/settings/SpeedSettingsScreen';
import { MultiplicationSettingsScreen } from './features/settings/MultiplicationSettingsScreen';
import { TestSettingsScreen } from './features/settings/TestSettingsScreen';
import { SurvivalSettingsScreen } from './features/settings/SurvivalSettingsScreen';
import { ChainSettingsScreen } from './features/settings/ChainSettingsScreen';
import { ChainTrainerScreen } from './features/trainer/ChainTrainerScreen';

type Screen = 'home' | 'settings' | 'trainer' | 'result' | 'stats';

export default function App() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [screen, setScreen] = useState<Screen>('home');
  const [activeConfig, setActiveConfig] = useState<TaskConfig | null>(null);
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  const [activeMode, setActiveMode] = useState<string | null>(null);

  useEffect(() => {
    storageService.loadProgress().then(setProgress);
    setUserName(storageService.getUserName());
  }, []);

  if (!progress) return <div className="p-6 text-center mt-10">Загрузка...</div>;

  const handleLogin = (name: string) => {
    storageService.saveUserName(name);
    setUserName(name);
  };

  const handleLogout = () => {
    storageService.logout();
    setUserName(null);
    setScreen('home');
  };

  const handleSelectMode = (mode: string) => {
    setActiveMode(mode);
    setScreen('settings');
  };

  const handleStart = async (config: TaskConfig) => {
    setActiveConfig(config);
    await storageService.saveProgress({ ...progress, currentConfig: config });
    setProgress({ ...progress, currentConfig: config });
    setScreen('trainer');
  };

  const handleFinish = async (result: SessionResult) => {
    await storageService.saveSession(result);
    const updated = await storageService.loadProgress();
    setProgress(updated);
    setLastResult(result);
    setScreen('result');
  };

  const handleLevelUp = async () => {
    if (!lastResult) return;
    const nextConfig = getNextLevelConfig(lastResult.config);
    await storageService.saveProgress({ ...progress, currentConfig: nextConfig });
    setProgress({ ...progress, currentConfig: nextConfig });
    handleStart(nextConfig);
  };

  const canLevelUp = lastResult ? shouldLevelUp(lastResult) : false;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8">
      {/* Единый контейнер для всего контента */}
      <div className="max-w-lg mx-auto px-4">
        
        {/* Логотип (как на макете) */}
        <div className="text-center mb-6">
          <button 
            onClick={() => setScreen('home')}
            className="text-xl font-bold text-blue-600 hover:text-blue-800"
          >
            Mental Math
          </button>
        </div>

        {/* Шапка */}
        <Header 
          userName={userName}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onGoHome={() => setScreen('home')}
          onGoStats={() => setScreen('stats')}
        />

        {/* Контент */}
        <main className="mt-8">
          {screen === 'home' && (
            <HomeScreen onSelectMode={handleSelectMode} />
          )}

        {screen === 'settings' && activeMode === 'speed' && (
          <SpeedSettingsScreen 
            onStart={handleStart} 
            onBack={() => setScreen('home')} 
          />
        )}

        {screen === 'settings' && activeMode === 'multiplication' && (
          <MultiplicationSettingsScreen 
            onStart={handleStart} 
            onBack={() => setScreen('home')} 
          />
        )}

        {screen === 'settings' && activeMode === 'test' && (
          <TestSettingsScreen
            onStart={handleStart}
            onBack={() => setScreen('home')} />
          )}

        {screen === 'settings' && activeMode === 'survival' && (
          <SurvivalSettingsScreen
            onStart={handleStart}
            onBack={() => setScreen('home')} />
          )}

        {screen === 'settings' && activeMode === 'chain' && (
          <ChainSettingsScreen
           onStart={handleStart}
           onBack={() => setScreen('home')} />
          )}

        {screen === 'settings' && !['speed', 'multiplication', 'test', 'survival', 'chain'].includes(activeMode || '') && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Настройка режима</h2>
              <button onClick={() => setScreen('home')} className="text-blue-600 text-sm hover:underline">
                ← Назад
              </button>
            </div>
            <SettingsScreen
              initialConfig={progress.currentConfig}
              onStart={handleStart}
            />
          </div>
        )}

        {screen === 'trainer' && activeConfig && (
          activeConfig.chainLength ? (
            <ChainTrainerScreen 
              config={activeConfig} 
              onFinish={handleFinish} 
              onGoHome={() => setScreen('home')} 
            />
          ) : (
            <TrainerScreen config={activeConfig} onFinish={handleFinish} />
          )
        )}

        {screen === 'result' && lastResult && (
          <ResultScreen
            result={lastResult}
            canLevelUp={canLevelUp}
            onLevelUp={handleLevelUp}
            onRestart={() => {
              if (activeMode) {
                handleSelectMode(activeMode); // Возвращаемся на экран настроек этого же режима
              } else {
                setScreen('home');
              }
            }}
            onGoHome={() => setScreen('home')}
          />
        )}

        {screen === 'stats' && (
            <StatsScreen 
            sessions={progress.sessions} 
            onBack={() => setScreen('home')} 
          />
        )}

        </main>
      </div>
    </div>
  );
}