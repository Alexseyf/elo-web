'use client';

import { useState } from 'react';
import type { SleepPeriod } from '@/app/lib/types/diario';

interface SonoProps {
  value: SleepPeriod[];
  onChange: (value: SleepPeriod[]) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7-19
const MINUTES = [0, 15, 30, 45];

export default function Sono({ value, onChange }: SonoProps) {
  const [newSleepHour, setNewSleepHour] = useState(7);
  const [newSleepMinute, setNewSleepMinute] = useState(0);
  const [newWakeHour, setNewWakeHour] = useState(7);
  const [newWakeMinute, setNewWakeMinute] = useState(15);

  const handleSleepHourChange = (hour: number) => {
    setNewSleepHour(hour);

    const currentWakeTime = newWakeHour * 60 + newWakeMinute;
    const newSleepTime = hour * 60 + newSleepMinute;

    if (currentWakeTime <= newSleepTime) {
      const nextMinuteIndex = MINUTES.findIndex(m => m > newSleepMinute);
      if (nextMinuteIndex !== -1) {
        setNewWakeHour(hour);
        setNewWakeMinute(MINUTES[nextMinuteIndex]);
      } else {
        if (hour < 19) {
          setNewWakeHour(hour + 1);
          setNewWakeMinute(MINUTES[0]);
        }
      }
    }
  };

  const handleSleepMinuteChange = (minute: number) => {
    setNewSleepMinute(minute);
    
    const currentWakeTime = newWakeHour * 60 + newWakeMinute;
    const newSleepTime = newSleepHour * 60 + minute;

    if (currentWakeTime <= newSleepTime) {
      const nextMinuteIndex = MINUTES.findIndex(m => m > minute);
      if (nextMinuteIndex !== -1) {
        setNewWakeHour(newSleepHour);
        setNewWakeMinute(MINUTES[nextMinuteIndex]);
      } else {
        if (newSleepHour < 19) {
          setNewWakeHour(newSleepHour + 1);
          setNewWakeMinute(MINUTES[0]);
        }
      }
    }
  };

  const formatTimeString = (hour: number, minute: number): string => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const calculateTotalTimeString = (
    sleepHour: number,
    sleepMinute: number,
    wakeHour: number,
    wakeMinute: number
  ): string => {
    if (sleepHour === wakeHour && sleepMinute === wakeMinute) {
      return '00:00';
    }

    let sleepMinutes = sleepHour * 60 + sleepMinute;
    let wakeMinutes = wakeHour * 60 + wakeMinute;

    if (wakeMinutes < sleepMinutes) {
      wakeMinutes += 24 * 60;
    }
    const diffMinutes = wakeMinutes - sleepMinutes;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const isTimeDisabled = (h: number, m: number, minHour?: number, minMinute?: number): boolean => {
    if (minHour === undefined || minMinute === undefined) return false;

    if (m === 0) {
      return h < minHour;
    }

    if (h === minHour) {
      return m <= minMinute;
    }

    return h < minHour;
  };

  const isTimesEqual = (): boolean => {
    return newSleepHour === newWakeHour && newSleepMinute === newWakeMinute;
  };

  const handleAddPeriod = () => {
    if (isTimesEqual()) return;

    const tempoTotal = calculateTotalTimeString(
      newSleepHour,
      newSleepMinute,
      newWakeHour,
      newWakeMinute
    );

    const newPeriod: SleepPeriod = {
      id: Date.now().toString(),
      sleepHour: newSleepHour,
      sleepMinute: newSleepMinute,
      wakeHour: newWakeHour,
      wakeMinute: newWakeMinute,
      saved: true,
      horaDormiu: formatTimeString(newSleepHour, newSleepMinute),
      horaAcordou: formatTimeString(newWakeHour, newWakeMinute),
      tempoTotal: tempoTotal,
    };
    onChange([...value, newPeriod]);
  };

  const handleRemoveSleep = (id: string) => {
    onChange(value.filter((period) => period.id !== id));
  };

  const formatDuration = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  };

  return (
    <div className="space-y-3 md:space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Sono</h2>
      <p className="text-gray-600 hidden md:block">Registre os períodos de sono da criança.</p>
      <div className="bg-blue-50 p-6 rounded-lg space-y-6">
        <h3 className="font-semibold text-gray-700 hidden md:block">Adicionar período de sono</h3>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Dormiu às</h4>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatTimeString(newSleepHour, newSleepMinute)}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Hora</label>
                      <div className="md:hidden overflow-x-auto">
                        <div className="flex gap-2 pb-2 min-w-max">
                          {HOURS.map((h) => (
                            <button
                              key={`sleep-hour-${h}`}
                              onClick={() => handleSleepHourChange(h)}
                              className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] ${
                                newSleepHour === h
                                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                              }`}
                            >
                              {h.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="grid grid-cols-4 gap-2">
                          {HOURS.slice(0, 8).map((h) => (
                            <button
                              key={`sleep-hour-${h}`}
                              onClick={() => handleSleepHourChange(h)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                newSleepHour === h
                                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                              }`}
                            >
                              {h.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {HOURS.slice(8).map((h) => (
                            <button
                              key={`sleep-hour-${h}`}
                              onClick={() => handleSleepHourChange(h)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                newSleepHour === h
                                  ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                              }`}
                            >
                              {h.toString().padStart(2, '0')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Minutos</label>
                      <div className="grid grid-cols-4 gap-2">
                        {MINUTES.map((m) => (
                          <button
                            key={`sleep-minute-${m}`}
                            onClick={() => handleSleepMinuteChange(m)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              newSleepMinute === m
                                ? 'bg-blue-500 text-white shadow-md transform scale-105'
                                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                            }`}
                          >
                            {m.toString().padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Acordou às</h4>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {formatTimeString(newWakeHour, newWakeMinute)}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Hora</label>
                      <div className="md:hidden overflow-x-auto">
                        <div className="flex gap-2 pb-2 min-w-max">
                          {HOURS.map((h) => {
                            const disabled = isTimeDisabled(h, 0, newSleepHour, newSleepMinute);
                            return (
                              <button
                                key={`wake-hour-${h}`}
                                onClick={() => {
                                  if (!disabled) {
                                    setNewWakeHour(h);
                                    if (h === newSleepHour && newWakeMinute <= newSleepMinute) {
                                      const nextMinuteIndex = MINUTES.findIndex(m => m > newSleepMinute);
                                      if (nextMinuteIndex !== -1) {
                                        setNewWakeMinute(MINUTES[nextMinuteIndex]);
                                      }
                                    }
                                  }
                                }}
                                disabled={disabled}
                                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-[44px] ${
                                  newWakeHour === h
                                    ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                                    : disabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                                }`}
                              >
                                {h.toString().padStart(2, '0')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="hidden md:block">
                        <div className="grid grid-cols-4 gap-2">
                          {HOURS.slice(0, 8).map((h) => {
                            const disabled = isTimeDisabled(h, 0, newSleepHour, newSleepMinute);
                            return (
                              <button
                                key={`wake-hour-${h}`}
                                onClick={() => {
                                  if (!disabled) {
                                    setNewWakeHour(h);
                                    if (h === newSleepHour && newWakeMinute <= newSleepMinute) {
                                      const nextMinuteIndex = MINUTES.findIndex(m => m > newSleepMinute);
                                      if (nextMinuteIndex !== -1) {
                                        setNewWakeMinute(MINUTES[nextMinuteIndex]);
                                      }
                                    }
                                  }
                                }}
                                disabled={disabled}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  newWakeHour === h
                                    ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                                    : disabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                                }`}
                              >
                                {h.toString().padStart(2, '0')}
                              </button>
                            );
                          })}
                        </div>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {HOURS.slice(8).map((h) => {
                            const disabled = isTimeDisabled(h, 0, newSleepHour, newSleepMinute);
                            return (
                              <button
                                key={`wake-hour-${h}`}
                                onClick={() => {
                                  if (!disabled) {
                                    setNewWakeHour(h);
                                    if (h === newSleepHour && newWakeMinute <= newSleepMinute) {
                                      const nextMinuteIndex = MINUTES.findIndex(m => m > newSleepMinute);
                                      if (nextMinuteIndex !== -1) {
                                        setNewWakeMinute(MINUTES[nextMinuteIndex]);
                                      }
                                    }
                                  }
                                }}
                                disabled={disabled}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  newWakeHour === h
                                    ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                                    : disabled
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                    : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                                }`}
                              >
                                {h.toString().padStart(2, '0')}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Minutos</label>
                      <div className="grid grid-cols-4 gap-2">
                        {MINUTES.map((m) => {
                          const disabled = isTimeDisabled(newWakeHour, m, newSleepHour, newSleepMinute);
                          return (
                            <button
                              key={`wake-minute-${m}`}
                              onClick={() => !disabled && setNewWakeMinute(m)}
                              disabled={disabled}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                newWakeMinute === m
                                  ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                                  : disabled
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                  : 'bg-white text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 border border-gray-200'
                              }`}
                            >
                              {m.toString().padStart(2, '0')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!isTimesEqual() && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-800 font-medium">
                  Duração total: {formatDuration(calculateTotalTimeString(newSleepHour, newSleepMinute, newWakeHour, newWakeMinute))}
                </span>
              </div>
            </div>
          )}
        </div>

        {isTimesEqual() && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-red-700 text-sm font-medium">
              O horário de acordar deve ser diferente do horário que dormiu.
            </span>
          </div>
        )}

        <button
          onClick={handleAddPeriod}
          disabled={isTimesEqual()}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform ${
            isTimesEqual()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="md:hidden">Adicionar período</span>
            <span className="hidden md:inline">Adicionar período de sono</span>
          </div>
        </button>
      </div>
      {value.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="text-base md:text-lg font-semibold text-gray-800">
              <span className="md:hidden">Registrados</span>
              <span className="hidden md:inline">Períodos registrados</span>
            </h3>
          </div>
          
          <div className="grid gap-3">
            {value.map((period, index) => (
              <div key={period.id} className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 md:gap-4">
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-8 h-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm md:text-lg font-semibold text-gray-800">
                            {period.horaDormiu}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="text-sm md:text-lg font-semibold text-gray-800">
                            {period.horaAcordou}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                        <svg className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">
                          <span className="hidden sm:inline">Duração: </span>
                          {formatDuration(period.tempoTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveSleep(period.id)}
                    className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                    title="Remover período"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg font-medium">
            Nenhum período de sono registrado
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Adicione um período acima para começar
          </p>
        </div>
      )}
    </div>
  );
}
