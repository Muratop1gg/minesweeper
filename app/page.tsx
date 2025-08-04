"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner"


interface DivGeneratorProps {
  count?: number; // Можно указать другое количе
}

type CellValue = '' | '0' | 'M' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type GameStatus = 'playing' | 'won' | 'lost';

export default function Home() {

  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [board, setBoard] = useState<CellValue[]>(Array(100).fill(''));
  const [mineIndexes, setMineIndexes] = useState<number[]>(() =>
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 100))
  );

  const restartGame = () => {
    setBoard(Array(100).fill(''))
    setGameStatus(`playing`)
    setMineIndexes(() =>
      Array.from({ length: 10 }, () => Math.floor(Math.random() * 100)))
  }

  const DivGenerator: React.FC<DivGeneratorProps> = ({
  }) => {




    // Функция для получения соседних клеток
    const getNeighbors = (index: number): number[] => {
      const neighbors = [];
      const row = Math.floor(index / 10);
      const col = index % 10;

      for (let r = Math.max(0, row - 1); r <= Math.min(9, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(9, col + 1); c++) {
          if (r !== row || c !== col) {
            neighbors.push(r * 10 + c);
          }
        }
      }
      return neighbors;
    };

    const revealAllMines = () => {
      const newBoard = [...board];
      mineIndexes.forEach(index => {
        newBoard[index] = 'M';
      });
      setBoard(newBoard)
      console.log(newBoard)
    }

    // Подсчет мин вокруг клетки
    const countMinesAround = (index: number): number => {
      return getNeighbors(index).filter(neighbor =>
        mineIndexes.includes(neighbor)
      ).length;
    };

    // Раскрытие клетки и соседних пустых клеток
    const revealCell = (index: number, visited = new Set<number>()) => {
      // Base cases
      if (visited.has(index)) return;
      if (board[index] !== '') return;
      if (mineIndexes.find((a) => (a == index))) {
        const newBoard = [...board];
        newBoard[index] = 'M';
        setBoard(newBoard);
        revealAllMines();
        setGameStatus("lost");
        toast('Game Over!', {
          action: {
            label: "Играть снова",
            onClick: () => restartGame(),
          },
        });

        return;
      }

      visited.add(index);
      const minesCount = countMinesAround(index);
      const newBoard = [...board];

      if (minesCount > 0) {
        newBoard[index] = minesCount.toString() as CellValue;
      } else {
        newBoard[index] = '0';
        // Process neighbors iteratively to avoid deep recursion
        const queue = [...getNeighbors(index)];

        while (queue.length > 0) {
          const neighbor = queue.shift()!;
          if (!visited.has(neighbor) && newBoard[neighbor] === '') {
            const neighborMines = countMinesAround(neighbor);
            if (neighborMines > 0) {
              newBoard[neighbor] = neighborMines.toString() as CellValue;
            } else {
              newBoard[neighbor] = '0';
              queue.push(...getNeighbors(neighbor).filter(n => !visited.has(n)));
            }
            visited.add(neighbor);
          }
        }
      }

      setBoard(newBoard);
    };



    // Проверка победы при каждом изменении доски
    useEffect(() => {
      if (gameStatus !== 'playing') return;

      const allNonMineCellsRevealed = board.every(
        (cell, index) => cell !== '' || mineIndexes.includes(index)
      );

      if (allNonMineCellsRevealed) {
        setGameStatus('won');
        revealAllMines();
        toast('Поздравляем! Вы победили!', {
          action: {
            label: "Играть снова",
            onClick: () => restartGame(),
          },
        });
      }
    }, [board, gameStatus, mineIndexes]);

    return <>{
      board.map((cell, index) => (
        <div
          key={index}
          className={`glow flex items-center justify-center bg-black hover:bg-pink-950 transition-colors duration-150 size-12 cursor-pointer`}
          onClick={() => gameStatus == "playing" && revealCell(index)}
        >
          <p className="text-4xl">{cell === '' ? '' : cell === 'M' ? '💣' : cell}</p>
        </div >
      ))
    }</>
  }

  return (
    <div className="bg-black h-screen font-sans items-center justify-center flex">
      <header className="absolute top-10 right-30">
        {gameStatus !== "playing" ? <Button className="glow hover:bg-zinc-800" onClick={restartGame}>Играть Снова!</Button> : null}
      </header>
      <main className="flex flex-col gap-[32px] row-start-2 items-center ">
        <div className="size-140 grid grid-cols-10 grid-rows-10 gap-3">
          <DivGenerator
            count={100}
          />
        </div>
      </main>
    </div>
  );
}

