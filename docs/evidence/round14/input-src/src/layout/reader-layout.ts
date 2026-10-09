export type ReadingSpace = 'collapsed' | 'reading' | 'focused';
export type ReaderLayout = ReturnType<typeof measureReaderLayout>;

// One space protocol. CSS receives these measurements, never a second breakpoint.
export function measureReaderLayout(width: number, height: number, headerBottom: number, safeBottom=0) {
  const type = width >= 1100 || (width >= 800 && width / height >= 1.15) ? 'side' : 'bottom';
  const bottomInset=Math.max(12,safeBottom+8),top = headerBottom + 8, bottom = height - bottomInset;
  const workspace = Math.max(0, bottom - top);
  const readingWidth = type === 'side'
    ? Math.min(420, Math.max(360, width * .30))
    : Math.min(width-24, 630);
  const focusedWidth = type === 'side' ? Math.min(620, Math.max(560, width * .44), width * .60) : Math.min(width-24, 720);
  const readingHeight = type === 'side' ? workspace : Math.max(0, Math.min(workspace * .48, workspace / 2 - 12));
  const focusedHeight = type === 'side' ? workspace : workspace * .94;
  return {type, width, height, top, bottom, bottomInset,workspace, readingWidth, focusedWidth, readingHeight, focusedHeight,
    defaultSpace: readingHeight - 108 < 220 ? 'collapsed' as const : 'reading' as const,
    directoryModal: type === 'bottom' || width < 1100};
}

export function canonicalRect(element: HTMLElement) {
  if(element.dataset.targetRect)return JSON.parse(element.dataset.targetRect) as {left:number;top:number;right:number;bottom:number};
  const origin = element.offsetParent?.getBoundingClientRect();
  const left = (origin?.left ?? 0) + element.offsetLeft, top = (origin?.top ?? 0) + element.offsetTop;
  return {left, top, right: left + element.offsetWidth, bottom: top + element.offsetHeight};
}

// Uses final layout geometry, not the temporary composited entrance/exit transform.
export function mapReadingArea(container: HTMLElement) {
  const bounds = container.getBoundingClientRect(), root = container.closest<HTMLElement>('.app');
  const header = root?.querySelector('.site-header')?.getBoundingClientRect();
  const footer = root?.querySelector<HTMLElement>('.map-footer');
  const sheet = root?.querySelector<HTMLElement>('.reading-sheet:not(.closing):not([data-suspended=true])');
  let left = bounds.left + 8, top = Math.max(bounds.top, (header?.bottom ?? bounds.top) + 8);
  let right = bounds.right - 8, bottom = Math.min(bounds.bottom - 8, innerHeight - Number.parseFloat(root?.style.getPropertyValue('--bottom-inset')||'12'));
  if (footer && getComputedStyle(footer).display !== 'none') bottom = Math.min(bottom, footer.getBoundingClientRect().top - 8);
  if (sheet) {
    const paper = canonicalRect(sheet);
    if (root?.dataset.readerLayout === 'side') right = Math.min(right, paper.left - 16);
    else bottom = Math.min(bottom, paper.top - 12);
  }
  return {left: left - bounds.left, top: top - bounds.top, width: Math.max(0, right - left), height: Math.max(0, bottom - top)};
}
