interface ClipBlockProps {
  title: string;
  startPx: number;
  widthPx: number;
  color: string;
  borderColor: string;
  onClick: () => void;
}

export function ClipBlock({
  title,
  startPx,
  widthPx,
  color,
  borderColor,
  onClick,
}: ClipBlockProps) {
  return (
    <div
      onClick={onClick}
      className={`absolute top-2 bottom-2 ${color} border-l-4 ${borderColor} border-y border-r border-ink-line rounded-sm cursor-pointer hover:brightness-125 transition-all overflow-hidden flex items-center px-3`}
      style={{
        left: `${startPx}px`,
        width: `${widthPx}px`,
      }}
    >
      <span className="metadata text-xs text-bone truncate">{title}</span>
    </div>
  );
}
