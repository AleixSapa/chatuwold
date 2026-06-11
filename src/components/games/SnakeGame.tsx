import React, { useEffect, useRef, useState } from 'react';

const SnakeGame: React.FC<{ onWin: (score: number) => void }> = ({ onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const scoreRef = useRef(0);

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 400;

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let snake = [{ x: 10, y: 10 }];
    let food = { x: 15, y: 15 };
    let dx = 1;
    let dy = 0;
    let interval: any;

    const draw = () => {
      // Move snake
      const head = { x: snake[0].x + dx, y: snake[0].y + dy };

      // Wall wraparound
      if (head.x < 0) head.x = (CANVAS_SIZE / GRID_SIZE) - 1;
      if (head.x >= CANVAS_SIZE / GRID_SIZE) head.x = 0;
      if (head.y < 0) head.y = (CANVAS_SIZE / GRID_SIZE) - 1;
      if (head.y >= CANVAS_SIZE / GRID_SIZE) head.y = 0;

      // Self collision
      if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame(scoreRef.current);
        return;
      }

      snake.unshift(head);

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        food = {
          x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
          y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
      } else {
        snake.pop();
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw food
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);

      // Draw snake
      ctx.fillStyle = '#10b981';
      snake.forEach((segment, i) => {
        if (i === 0) ctx.fillStyle = '#34d399';
        else ctx.fillStyle = '#059669';
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
      });
    };

    const endGame = (finalScore: number) => {
      clearInterval(interval);
      setGameOver(true);
      if (finalScore > 0) onWin(finalScore); // 1 Chatu per point
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase()) || 
          ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (dy === 0) { dx = 0; dy = -1; } break;
        case 'arrowdown':
        case 's':
          if (dy === 0) { dx = 0; dy = 1; } break;
        case 'arrowleft':
        case 'a':
          if (dx === 0) { dx = -1; dy = 0; } break;
        case 'arrowright':
        case 'd':
          if (dx === 0) { dx = 1; dy = 0; } break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    interval = setInterval(draw, 100);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameOver]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-black/40 p-4 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_SIZE} 
          height={CANVAS_SIZE}
          className="rounded-xl"
        />
        
        {!gameStarted && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-2xl font-black text-white uppercase mb-2">Snake</h3>
            <p className="text-slate-400 text-sm mb-6">Usa les fletxes per moure't. Menja per guanyar Chatus!</p>
            <button 
              onClick={() => { 
                scoreRef.current = 0;
                setGameStarted(true); 
              }}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-primary/40"
            >
              Començar Joc
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center">
            <h3 className="text-3xl font-black text-red-500 uppercase mb-2">Game Over</h3>
            <p className="text-white font-bold mb-6">Puntuació: {score}</p>
            <button 
              onClick={() => { 
                scoreRef.current = 0;
                setGameOver(false); 
                setScore(0); 
              }}
              className="px-8 py-3 bg-white/10 text-white font-bold rounded-xl"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
      
      <div className="flex gap-10 items-center bg-black/20 px-6 py-3 rounded-2xl border border-white/5">
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Punts</p>
          <p className="text-xl font-mono font-bold text-white">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Chatus Guanyats</p>
          <p className="text-xl font-mono font-bold text-gold">{score}</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
