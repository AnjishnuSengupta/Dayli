
import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';

interface MoodPickerProps {
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
}

const MoodPicker: React.FC<MoodPickerProps> = ({ selectedMood, setSelectedMood }) => {
  const moods = [
    { value: 'happy', icon: <Smile />, color: 'text-yellow-500', label: 'Happy' },
    { value: 'neutral', icon: <Meh />, color: 'text-blue-400', label: 'Neutral' },
    { value: 'sad', icon: <Frown />, color: 'text-purple-400', label: 'Sad' },
  ];

  return (
    <div className="mood-picker flex gap-4 justify-center my-4">
      {moods.map((mood) => (
        <button
          key={mood.value}
          className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
            selectedMood === mood.value
              ? 'bg-white shadow-md scale-110'
              : 'hover:bg-white/50'
          }`}
          onClick={() => setSelectedMood(mood.value)}
        >
          <div className={`${mood.color} ${selectedMood === mood.value ? 'animate-pulse-gentle' : ''}`}>
            {mood.icon}
          </div>
          <span className="text-sm">{mood.label}</span>
        </button>
      ))}
    </div>
  );
};

export default MoodPicker;
