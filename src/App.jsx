import { useState, useEffect } from 'react';
import redHorse from './assets/red-horse.png';
import blackHorse from './assets/black-horse.png';

const suits = ['♠', '♥', '♦', '♣'];
const values = Array.from({ length: 13 }, (_, i) => i + 2);
const valueToDisplay = (value) => {
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  if (value === 14) return 'A';
  return value.toString();
};

const getSuitColor = (suit) => {
  switch (suit) {
    case '♠': return 'text-blue-400';
    case '♥': return 'text-red-400';
    case '♦': return 'text-pink-400';
    case '♣': return 'text-green-400';
    default: return 'text-white';
  }
};

const generateDeck = () =>
  suits.flatMap(suit => values.map(value => ({ suit, value })))
       .sort(() => Math.random() - 0.5);

export default function App() {
  const [deck, setDeck] = useState([]);
  const [log, setLog] = useState([]);
  const [redPos, setRedPos] = useState(0);
  const [blackPos, setBlackPos] = useState(0);
  const [lastCard, setLastCard] = useState(null);
  const [winner, setWinner] = useState(null);
  const [betRed, setBetRed] = useState(0);
  const [betBlack, setBetBlack] = useState(0);
  const [betSuit, setBetSuit] = useState(0);
  const [betStraight, setBetStraight] = useState(0);
  const [countdown, setCountdown] = useState(10);
  const [isCounting, setIsCounting] = useState(false);

  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && !winner) {
      startGame();
      setIsCounting(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  useEffect(() => {
    let auto;
    if (deck.length > 0 && !winner) {
      auto = setTimeout(drawCard, 1000);
    }
    return () => clearTimeout(auto);
  }, [deck, winner]);

  const drawCard = () => {
    if (!deck.length || winner) return;
    const [next, ...rest] = deck;
    const color = ['♥', '♦'].includes(next.suit) ? 'red' : 'black';
    const canMove =
      !lastCard || next.value >= lastCard.value ||
      (['♥', '♦'].includes(lastCard.suit) ? 'red' : 'black') === color;

    const display = `${next.suit}${valueToDisplay(next.value)}`;
    const suitClass = getSuitColor(next.suit);
    const logText = `<span class="${suitClass}">${display}</span> → ${canMove ? color.toUpperCase() + ' +1' : 'No move'}`;
    setLog(prev => [...prev, logText]);
    setLastCard(next);
    setDeck(rest);
    if (canMove) {
      if (color === 'red') setRedPos(prev => prev + 1);
      else setBlackPos(prev => prev + 1);
    }

    if ((color === 'red' && redPos + 1 >= 5) || (color === 'black' && blackPos + 1 >= 5)) {
      setWinner(color);
      setLog(prev => [...prev, `${color.toUpperCase()} WINS!`]);
    }
  };

  const startCountdown = () => {
    setCountdown(10);
    setIsCounting(true);
  };

  const startGame = () => {
    setDeck(generateDeck());
    setRedPos(0);
    setBlackPos(0);
    setLastCard(null);
    setWinner(null);
    setLog([`🏁 Race Started! BET: RED ${betRed} / BLACK ${betBlack} / SUIT ${betSuit} / STRAIGHT ${betStraight}`]);
  };

  const addChips = (color, amount) => {
    if (color === 'red') setBetRed(prev => prev + amount);
    if (color === 'black') setBetBlack(prev => prev + amount);
  };

  const Track = ({ position, color }) => (
    <div className="flex gap-2 items-center mb-2">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="w-20 h-20 bg-transparent border border-yellow-400 rounded flex items-center justify-center">
          {i === position && (
            <img
              src={color === 'red' ? redHorse : blackHorse}
              alt={`${color} horse`}
              className="w-16 h-16 object-contain"
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-green-900 text-yellow-300 font-serif p-6">
      <div className="max-w-5xl mx-auto border-4 border-yellow-500 rounded-xl shadow-xl bg-green-800 p-8">
        <h1 className="text-5xl font-bold text-center mb-6">ROYAL DERBY</h1>

        <div className="flex justify-around items-start mb-8">
          <div>
            <Track position={blackPos} color="black" />
            <p className="text-center mt-2 font-semibold">BLACK</p>
          </div>
          <div className="text-center">
            {lastCard && (
              <div className="text-4xl mb-2">{lastCard.suit}{valueToDisplay(lastCard.value)}</div>
            )}
            {!winner && (
              <button onClick={startCountdown} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded">
                START BETTING
              </button>
            )}
            {isCounting && <div className="text-2xl mt-2">{countdown}</div>}
          </div>
          <div>
            <Track position={redPos} color="red" />
            <p className="text-center mt-2 font-semibold">RED</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 text-center mb-8">
          <div>
            <p className="mb-2">🔴 RED</p>
            <button onClick={() => addChips('red', 5)} className="bg-red-600 px-4 py-2 rounded-full">+5</button>
            <p className="mt-1">Bet: {betRed}</p>
          </div>
          <div>
            <p className="mb-2">⚫ BLACK</p>
            <button onClick={() => addChips('black', 5)} className="bg-black text-white px-4 py-2 rounded-full">+5</button>
            <p className="mt-1">Bet: {betBlack}</p>
          </div>
          <div>
            <p className="mb-2">SUIT FINISH</p>
            <input type="number" value={betSuit} onChange={(e) => setBetSuit(+e.target.value)} className="text-black w-20 px-2 py-1 rounded" />
          </div>
          <div>
            <p className="mb-2">STRAIGHT STRIKE</p>
            <input type="number" value={betStraight} onChange={(e) => setBetStraight(+e.target.value)} className="text-black w-20 px-2 py-1 rounded" />
          </div>
        </div>

        {winner && <p className="text-center text-3xl font-bold text-yellow-400 mb-4">🏆 {winner.toUpperCase()} WINS!</p>}

        <div className="bg-black text-green-300 p-4 rounded h-40 overflow-y-auto text-sm border border-green-600">
          {log.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line }} />)}
        </div>
      </div>
    </div>
  );
}
