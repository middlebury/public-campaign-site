export function onOutOfElementView(
  el: HTMLElement,
  cb: (entry: IntersectionObserverEntry) => void
) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio === 0) {
        cb(entry);

        io.unobserve(el);
      }
    });
  });

  io.observe(el);

  return io;
}
