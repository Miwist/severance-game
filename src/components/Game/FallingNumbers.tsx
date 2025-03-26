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
    { id: 3, name: "Cold Harbor", capacity: 200, filled: 0 },
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
    setHoveredNumber(id);
  };

  const handleMouseLeave = () => {
    setHoveredNumber(null);
  };

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

        const newHighlightedNumbers: number[] = [];
        const availableNumbers = numbers.filter((number) => !number.falling); //  Убираем already falling
        if (availableNumbers.length >= 9) {
          for (let i = 0; i < 9; i++) {
            const randomIndex = Math.floor(
              Math.random() * availableNumbers.length
            );
            newHighlightedNumbers.push(availableNumbers[randomIndex].id);
          }
        }
        setHighlightedNumbers(newHighlightedNumbers);
      }, 3000);

      return () => clearInterval(highlightInterval);
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
    // animationFrameId.current = requestAnimationFrame(updateFallingNumbers);
    setStartGameInfo(true);
  };

  return (
    <div className="falling-numbers-container">
      <h1>Обработка Данных Lumon</h1>
      <h3>{`${startGameInfo ? "Обрабатывайте" : "Пауза"}`}</h3>

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
                : "default", // change курсор
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
        <button onClick={toggleSound}>
          {isSoundOn ? "🔊 Выкл звук" : "🔇 Вкл звук"}
        </button>
      </div>

      <p className="message">
        Пожалуйста, продолжайте сортировку. Ваша производительность важна.
      </p>
    </div>
  );
}

export default FallingNumbers;
