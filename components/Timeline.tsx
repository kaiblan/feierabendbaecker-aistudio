
import React, { useRef, useState } from 'react';
import { Stage } from '../types';
import TimelineCard from './TimelineCard';

interface TimelineProps {
  stages: Stage[];
  activeIndex: number;
  orientation: 'horizontal' | 'vertical';
  onSelectStage?: (index: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({ stages, activeIndex, orientation, onSelectStage }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [dragging, setDragging] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    const el = sliderRef.current;
    if (!el) return;
    isDown.current = true;
    setDragging(true);
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    // prevent text selection while dragging
    document.body.style.userSelect = 'none';
  };

  const onMouseLeave = () => {
    isDown.current = false;
    setDragging(false);
    document.body.style.userSelect = '';
  };

  const onMouseUp = () => {
    isDown.current = false;
    setDragging(false);
    document.body.style.userSelect = '';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = sliderRef.current;
    if (!isDown.current || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1; // scroll-fast multiplier
    el.scrollLeft = scrollLeft.current - walk;
  };

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    const el = sliderRef.current;
    if (!el) return;
    isDown.current = true;
    setDragging(true);
    startX.current = e.touches[0].pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const el = sliderRef.current;
    if (!isDown.current || !el) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1;
    el.scrollLeft = scrollLeft.current - walk;
  };

  const onTouchEnd = () => {
    isDown.current = false;
    setDragging(false);
  };
  return (
    <div
      ref={sliderRef}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`flex ${orientation === 'horizontal' ? 'flex-row overflow-x-auto h-24 items-center px-4 space-x-2' : 'flex-col space-y-4 px-2'} border-slate-700 bg-slate-950/50 backdrop-blur-sm ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      {stages.map((stage, idx) => {
        const isActive = idx === activeIndex;
        const isCompleted = stage.completed;

        return (
          <TimelineCard
            key={stage.id}
            stage={stage}
            isActive={isActive}
            isCompleted={isCompleted}
            orientation={orientation}
          />
        );
      })}
    </div>
  );
};

export default Timeline;
