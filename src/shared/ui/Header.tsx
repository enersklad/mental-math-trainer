import { useState } from 'react';

interface Props {
  userName: string | null;
  onLogin: (name: string) => void;
  onLogout: () => void;
  onGoHome: () => void;
  onGoStats: () => void;
}

export function Header({ userName, onLogin, onLogout, onGoHome, onGoStats }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputName, setInputName] = useState('');

  const handleLogin = () => {
    if (inputName.trim()) {
      onLogin(inputName.trim());
      setIsModalOpen(false);
      setInputName('');
    }
  };

  return (
    <>
      {/* Обертка для рамки, как на макете */}
      <div className="border-2 border-gray-300 rounded-xl p-4 flex justify-between items-center bg-white">
        {!userName ? (
          <>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium hover:text-blue-600 transition-colors px-4"
            >
              АВТОРИЗАЦИЯ
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium hover:text-blue-600 transition-colors px-4"
            >
              РЕГИСТРАЦИЯ
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={onGoHome}
              className="text-sm font-medium hover:text-blue-600 transition-colors px-4"
            >
              НА ГЛАВНУЮ
            </button>
            <div className="flex items-center gap-4 px-4">
              <button 
                onClick={onGoStats}
                className="text-sm font-medium hover:text-blue-600 transition-colors"
              >
                {userName}
              </button>
              <button 
                onClick={onLogout}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                ВЫЙТИ
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модальное окно авторизации (остается без изменений) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h2 className="text-xl font-bold mb-4">Вход в профиль</h2>
            <p className="text-sm text-gray-500 mb-4">
              Введите имя, чтобы сохранять статистику под этим именем.
            </p>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Ваше имя"
              className="border-2 border-gray-300 rounded px-3 py-2 w-full mb-4 focus:border-blue-500 outline-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Отмена
              </button>
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}