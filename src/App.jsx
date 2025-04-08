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
    setLog([`🏁 Race Started! Bet: RED ${betRed || 0} / BLACK ${betBlack || 0} / SUIT ${betSuit || 0} / STRAIGHT ${betStraight || 0}`]);
  };

  const Track = ({ position, color }) => (
    <div className="flex gap-2 items-center mb-2">
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} className="w-16 h-16 bg-green-800 border-2 rounded flex items-center justify-center shadow-lg">
          {i === position && (
            <span className={`text-lg font-black ${color === 'red' ? 'text-red-400' : 'text-gray-300'}`}>
              {color === 'red' ? 'RED HORSE' : 'BLACK HORSE'}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-6 text-white font-mono">
      <div className="max-w-2xl mx-auto bg-green-950 shadow-xl rounded-xl p-6 border border-yellow-300">
        <h1 className="text-4xl text-center text-yellow-400 font-bold mb-6 drop-shadow">ROYAL DERBY</h1>
        <Track position={redPos} color="red" />
        <Track position={blackPos} color="black" />

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm mb-1 text-yellow-200">Red Bet</label>
            <input
              type="number"
              placeholder="RED BET"
              value={betRed}
              onChange={(e) => setBetRed(e.target.value)}
              className="text-black px-3 py-2 rounded w-full border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-yellow-200">Black Bet</label>
            <input
              type="number"
              placeholder="BLACK BET"
              value={betBlack}
              onChange={(e) => setBetBlack(e.target.value)}
              className="text-black px-3 py-2 rounded w-full border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-yellow-200">Suit Finish</label>
            <input
              type="number"
              placeholder="SUIT FINISH BET"
              value={betSuit}
              onChange={(e) => setBetSuit(e.target.value)}
              className="text-black px-3 py-2 rounded w-full border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-yellow-200">Straight Strike</label>
            <input
              type="number"
              placeholder="STRAIGHT BET"
              value={betStraight}
              onChange={(e) => setBetStraight(e.target.value)}
              className="text-black px-3 py-2 rounded w-full border border-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <button onClick={startCountdown} className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-6 py-3 rounded shadow">
            START BETTING
          </button>
        </div>

        {isCounting && <p className="text-center text-xl text-red-300 font-semibold mb-2">Countdown: {countdown}s</p>}
        {winner && <p className="text-center text-3xl text-yellow-500 font-bold mb-4">🏆 {winner.toUpperCase()} WINS!</p>}

        <div className="bg-black p-4 rounded-xl h-48 overflow-y-auto text-green-300 text-sm border border-green-700">
          {log.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line }} />)}
        </div>
      </div>
    </div>
  );
}
