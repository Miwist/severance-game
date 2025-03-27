import React, { useState, useEffect, useRef } from "react";
import "./FallingNumbers.css";
import { useAudio } from "../UseAudio/UseAudio";

interface NumberType {
  id: number;
  value: number;
  x: number;
  y: number;
  highlighted: boolean;
  falling: boolean;
}

interface BoxType {
  id: number;
  name: string;
  capacity: number;
  filled: number;
}

function FallingNumbers() {
  const [hoveredNumber, setHoveredNumber] = useState<number | null>(null);
  const [numbers, setNumbers] = useState<NumberType[]>([]);
  const [startGameInfo, setStartGameInfo] = useState<boolean>(true);
  const [highlightedNumbers, setHighlightedNumbers] = useState<number[]>([]);
  const [boxes, setBoxes] = useState<BoxType[]>([
    { id: 1, name: "01", capacity: 100, filled: 0 },
    { id: 2, name: "02", capacity: 150, filled: 0 },
    { id: 3, name: "03", capacity: 200, filled: 0 },
    { id: 4, name: "04", capacity: 300, filled: 0 },
    { id: 5, name: "05", capacity: 500, filled: 0 },
  ]);
  const [score, setScore] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const isRunning = useRef(true);
  const playlist = useRef<string[]>([
    "./music/still.mp3",
    "./music/done.mp3",
    "./music/love.mp3",
    "./music/still.mp3",
  ]);
  const { isSoundOn, toggleSound } = useAudio();
  const [count, setCount] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  // Grid configuration
  const gridSize = 20; // Number of cells in each row/column
  const cellWidth = 100 / gridSize; // Percentage width of each cell
  const cellHeight = 100 / gridSize; // Percentage height of each cell

  const handleMouseEnter = (id: number) => {
    if (id) {
      setHoveredNumber(id);
      handleClick(id);
    }
  };

  const handleMouseLeave = () => {
    setHoveredNumber(null);
  };

  // Генерация всех чисел
  const getInitialNumbers = () => {
    const initialNumbers: NumberType[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        initialNumbers.push({
          id: Math.random(),
          value: Math.floor(Math.random() * 10),
          x: col * cellWidth, // X position based on grid
          y: row * cellHeight, // Y position based on grid
          highlighted: false,
          falling: false,
        });
      }
    }
    setNumbers(initialNumbers);
  };

  useEffect(() => {
    getInitialNumbers();
  }, [cellWidth, cellHeight, gridSize]);

  useEffect(() => {
    if (isRunning.current) {


      const highlightInterval = setInterval(() => {
        if (!isRunning.current) {
          clearInterval(highlightInterval);
          return;
        }

        const availableNumbers = numbers.filter((number) => !number.falling);
        const newHighlightedNumbers: number[] = [];

        // Появление 9 чисел
        if (availableNumbers.length >= 9) {
          const cols = 20;
          const rows = Math.ceil(availableNumbers.length / cols);

          if (cols >= 3 && rows >= 3) {
            const maxStartRow = rows - 3;
            const maxStartCol = cols - 3;

            const startRow = Math.floor(Math.random() * (maxStartRow + 1));
            const startCol = Math.floor(Math.random() * (maxStartCol + 1));

            for (let i = 0; i < 3; i++) {
              for (let j = 0; j < 3; j++) {
                const index = (startRow + i) * cols + (startCol + j);
                if (availableNumbers[index]) {
                  newHighlightedNumbers.push(availableNumbers[index].id);
                }
              }
            }

            setHighlightedNumbers(newHighlightedNumbers);
          }
        }
      }, 3000);

      // Интервал для добавления новых чисел (каждые 3 секунды)
      // const replenishInterval = setInterval(() => {
      //   if (!isRunning.current) return;

      //   // В интервале replenishInterval:
      //   setNumbers((prevNumbers: any) => {
      //     const currentNumbers = prevNumbers.filter((n: any) => !n.falling);
      //     const cols = 20;
      //     const rows = 10;
      //     const grid = Array(cols * rows).fill(null);

      //     // Заполняем сетку существующими числами
      //     currentNumbers.forEach((num: any) => {
      //       const col = Math.floor(num.x / (100 / cols));
      //       const row = Math.floor(num.y / (100 / rows));
      //       grid[row * cols + col] = num;
      //     });

      //     // Добавляем числа в пустые ячейки
      //     const newNumbers = grid.reduce((acc, cell, index) => {
      //       if (!cell && Math.random() > 0.8) {
      //         // 70% шанс заполнить пустую ячейку
      //         const row = Math.floor(index / cols);
      //         const col = index % cols;
      //         acc.push({
      //           id: Date.now() + Math.random(),
      //           value: Math.floor(Math.random() * 9) + 1,
      //           x: col * (100 / cols),
      //           y: row * (100 / rows),
      //           falling: false,
      //         });
      //       }
      //       return acc;
      //     }, []);

      //     return [...currentNumbers, ...newNumbers];
      //   });
      // }, 3500);

      return () => clearInterval(highlightInterval);
        // clearInterval(replenishInterval);
    }
  }, [numbers]);

  const handleClick = (id: number) => {
    if (!highlightedNumbers.includes(id)) return;

    setNumbers((prevNumbers) => {
      return prevNumbers.map((number) => {
        if (number.id === id) {
          return { ...number, falling: true, highlighted: false, y: 0 };
        }
        return number;
      });
    });

    setHighlightedNumbers((prevHighlighted) =>
      prevHighlighted.filter((numberId) => numberId !== id)
    );

    setCount((prev: number) => prev + 1);
  };

  useEffect(() => {
    const numbersToRemove = numbers.filter(
      (number) => number.falling && number.y == 0
    );

    if (numbersToRemove.length > 0) {
      setScore((prevScore) => prevScore + 1);
      setBoxes((prevBoxes) => {
        let remainingNumbers = 1;
        const updatedBoxes = prevBoxes.map((box) => {
          if (remainingNumbers > 0) {
            const addedAmount = Math.min(
              box.capacity - box.filled,
              remainingNumbers
            );
            remainingNumbers -= addedAmount;
            return {
              ...box,
              filled: box.filled + addedAmount,
            };
          } else {
            return box;
          }
        });
        return updatedBoxes;
      });

      if (!numbers.length) {
        getInitialNumbers();
      }
    }
  }, [count]);

  const stopGame = () => {
    isRunning.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
    setStartGameInfo(false);
  };

  const startGame = () => {
    isRunning.current = true;
    setStartGameInfo(true);
  };

  return (
    <div className="falling-numbers-container">
      <h1>Обработка Данных Lumon</h1>
              <button onClick={toggleSound}>
          {isSoundOn ? "🔊 Выкл звук" : "🔇 Вкл звук"}
        </button>
      <p className="message">{`${startGameInfo ? "Пожалуйста, продолжайте сортировку. Ваша производительность важна." : "Передохните"}`}</p>
      <div className="numbers-container" ref={containerRef}>
        {numbers.map((number) => (
          <div
            key={number.id}
            className={`number ${
              highlightedNumbers.includes(number.id) ? "highlighted" : ""
            } ${number.falling ? "falling" : ""}`}
            style={{
              left: `${number.x}%`,
              top: `${number.y}%`,
              width: `${cellWidth}%`,
              height: `${cellHeight}%`,
              cursor: highlightedNumbers.includes(number.id)
                ? "pointer"
                : "default",
            }}
            onClick={() => handleClick(number.id)}
            onMouseEnter={() => handleMouseEnter(number.id)}
            onMouseLeave={handleMouseLeave}
          >
            {number.value}
          </div>
        ))}
      </div>

      <div className="boxes-container">
        {boxes.map((box) => (
          <div key={box.id} className="box">
            <div className="box-name">{box.name}</div>
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${(box.filled / box.capacity) * 100}%` }}
              />
            </div>
            <div className="box-info">
              {box.filled} / {box.capacity}
            </div>
          </div>
        ))}
      </div>

      <div className="score">Счет: {score}</div>
      <div className="controls">
        <button onClick={stopGame}>Остановить</button>
        <button onClick={startGame}>Запустить</button>

      </div>


    </div>
  );
}

export default FallingNumbers;
