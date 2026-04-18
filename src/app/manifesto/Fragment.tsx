interface FragmentProps {
  n: number | string;
  children: React.ReactNode;
  struck?: boolean;
  editor?: boolean;
}

export function Fragment({ n, children, struck = false, editor = false }: FragmentProps) {
  return (
    <div className="flex gap-5 text-base sm:text-lg leading-8 text-neutral-300">
      <span className="text-neutral-600 font-mono text-xs pt-2 w-12 flex-shrink-0 text-right">
        §{n}
      </span>
      <div
        className={`flex-1 ${struck ? 'line-through decoration-neutral-500 decoration-[1px]' : ''} ${
          editor ? 'italic text-neutral-500 text-sm leading-7' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
