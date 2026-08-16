// A screen-reader-only status region. The canvas is opaque to assistive
// tech, so this is the non-visual equivalent of "glance at the farm and
// see where things stand" — updated whenever the underlying summary text
// changes, announced politely (no interruption).
export function LiveRegion({ text }: { text: string }) {
  return (
    <div aria-live="polite" role="status" className="sr-only">
      {text}
    </div>
  );
}
