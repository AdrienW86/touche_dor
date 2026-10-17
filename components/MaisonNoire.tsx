/**
 * Fidelity-first adapter: the original HTML, CSS, Three.js r128 and camera logic
 * run unmodified in an isolated document. A later React migration can replace
 * this adapter after visual/navigation parity has been verified.
 */
export default function MaisonNoire() {
  return (
    <iframe
      className="maison-frame"
      src="/prototype/maison-noire.html"
      title="Maison noire — visite immersive"
      allow="fullscreen"
    />
  );
}
