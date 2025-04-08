
import { useState, useEffect } from 'react';

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
  const [betRed, setBetRed] = useState('');
  const [betBlack, setBetBlack] = useState('');
  const [betSuit, setBetSuit] = useState('');
  const [betStraight, setBetStraight] = useState('');
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
      auto = setTimeout(drawCard, 1200);
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
    setLog([`🏁 Race Started! Bet: RED ${betRed || 0} / BLACK ${betBlack || 0} / SUIT ${betSuit || 0} / STRAIGHT ${betStraight || 0}`]);
  };

  const Track = ({ position, color }) => (
    <div className="flex gap-2 items-center mb-2">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="w-10 h-10 bg-green-700 border flex items-center justify-center">
          {i === position && <span className="text-xl">{color === 'red' ? '🐎' : '🏇'}</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-4 max-w-lg mx-auto text-white">
      <h1 className="text-3xl text-center text-yellow-300 font-bold mb-4">Royal Derby</h1>
      <Track position={redPos} color="red" />
      <Track position={blackPos} color="black" />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm mb-1">Red Bet</label>
          <input
            type="number"
            placeholder="Enter Red Bet"
            value={betRed}
            onChange={(e) => setBetRed(e.target.value)}
            className="text-black px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Black Bet</label>
          <input
            type="number"
            placeholder="Enter Black Bet"
            value={betBlack}
            onChange={(e) => setBetBlack(e.target.value)}
            className="text-black px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Suit Finish Bet</label>
          <input
            type="number"
            placeholder="Enter Suit Finish Bet"
            value={betSuit}
            onChange={(e) => setBetSuit(e.target.value)}
            className="text-black px-2 py-1 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Straight Strike Bet</label>
          <input
            type="number"
            placeholder="Enter Straight Bet"
            value={betStraight}
            onChange={(e) => setBetStraight(e.target.value)}
            className="text-black px-2 py-1 rounded w-full"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={startCountdown} className="bg-yellow-400 text-black px-4 py-2 rounded">
          Start Betting
        </button>
      </div>

      {isCounting && <p className="text-center text-lg text-red-400 mt-2">Countdown: {countdown}s</p>}

      {winner && <p className="text-center text-2xl font-bold mt-4">{winner.toUpperCase()} Wins!</p>}

      <div className="bg-black mt-4 p-2 rounded h-40 overflow-y-auto text-green-400 text-sm">
        {log.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line }} />)}
      </div>
    </div>
  );
}
