import React, { useRef, useState, useEffect } from 'react';
import { Stage } from '../types';
import ActiveTimelineCard from './ActiveTimelineCard';

interface TimelineProps {
  stages: Stage[];
  activeIndex: number;
  orientation: 'horizontal' | 'vertical';
  onSelectStage?: (index: number) => void;
}

const ActiveTimeline: React.FC<TimelineProps> = ({ stages, activeIndex, orientation, onSelectStage }) => {
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
    const walk = (x - startX.current) * 1;
    el.scrollLeft = scrollLeft.current - walk;
  };

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

  // Center the active stage in the viewport when activeIndex changes
  useEffect(() => {
    if (orientation !== 'horizontal') return;
    const el = sliderRef.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(activeIndex, stages.length - 1));
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    const childCenter = child.offsetLeft + child.offsetWidth / 2;
    const containerCenter = el.clientWidth / 2;
    const target = Math.max(0, childCenter - containerCenter);
    try {
      el.scrollTo({ left: target, behavior: 'smooth' });
    } catch {
      el.scrollLeft = target;
    }
  }, [activeIndex, orientation, stages.length]);
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
          <ActiveTimelineCard
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

export default ActiveTimeline;
