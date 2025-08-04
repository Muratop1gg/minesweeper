"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner"


interface DivGeneratorProps {
  count?: number; // Можно указать другое количе
}

type CellValue = '' | '0' | 'M' | 'MK' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';
type GameStatus = 'playing' | 'won' | 'lost';

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import React from "react";

export default function Home() {
  const [minesCount, setMinesCount] = React.useState([10])
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [board, setBoard] = useState<CellValue[]>(Array(100).fill(''));
  const [mineIndexes, setMineIndexes] = useState<number[]>(() =>
    Array.from({ length: minesCount[0] }, () => Math.floor(Math.random() * 100))
  );

  const restartGame = () => {
    setBoard(Array(100).fill(''))
    setGameStatus(`playing`)
    setMineIndexes(() =>
      Array.from({ length: minesCount[0] }, () => Math.floor(Math.random() * 100)))
  }

  useEffect(() => {
    restartGame()
  }, [minesCount])

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
    }

    // Подсчет мин вокруг клетки
    const countMinesAround = (index: number): number => {
      return getNeighbors(index).filter(neighbor =>
        mineIndexes.includes(neighbor)
      ).length;
    };

    const handleRightClick = (index: number) => {
      const newBoard = [...board];
      if (newBoard[index] !== '' && newBoard[index] !== "MK") return;
      if (newBoard[index] === 'MK') newBoard[index] = ''
      else newBoard[index] = 'MK';
      setBoard(newBoard);
      console.log(123)
    }

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
        toast('Поражение!', {
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
          onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => { e.preventDefault(); handleRightClick(index) }}
          className={`glow glow-hover flex items-center hover:scale-[1.05] justify-center bg-black hover:bg-pink-950 transition-all duration-100 size-12 cursor-pointer`}
          onClick={() => gameStatus == "playing" && revealCell(index)}
        >
          <p className="text-4xl">{cell === '' ? '' : cell === 'M' ? '💣' : cell === 'MK' ? '🚩' : cell}</p>
        </div >
      ))
    }</>
  }

  return (
    <><div className="flex h-screen items-center justify-center">
      <div className="h-screen font-sans items-center justify-center flex">
        <header className="absolute top-10">
          {gameStatus !== "playing" ? <Button className="glow glow-hover text-3xl w-60 h-15 rounded-xl hover:bg-zinc-800 cursor-pointer" onClick={restartGame}>Играть Снова!</Button> : null}
        </header>
        <main className="flex flex-col gap-[32px] row-start-2 items-center ">
          <div className="size-140 grid grid-cols-10 grid-rows-10 gap-12" onContextMenu={(e: React.MouseEvent<HTMLDivElement>) => (e.preventDefault())}>
            <DivGenerator
              count={100}
            />
          </div>
        </main>
      </div>
      <div className="absolute w-150 h-220 mt-30 glow right-10 rounded-tl-4xl rounded-br-4xl rounded-tr-xl rounded-bl-xl">
        <div className="flex gap-10">
          Количество мин
          <Slider
            defaultValue={[10]}
            max={20}
            min={5}
            step={1}
            className={cn("w-[60%]")}
            onValueChange={setMinesCount}
          />
          {minesCount[0]}
        </div>
        <div className="flex gap-10">
          Размер поля
        </div>
      </div>
    </div>

    </>

  );
}

