import { Link } from "react-router-dom";

export function VertexLogo({ size = 34, showText = true, logo }) {
  return (
    <Link to="/" data-testid="brand-logo" className="flex items-center gap-3 group">
      {logo ? (
        <img src={logo} alt="Vertex Studio" style={{ height: size }} className="w-auto object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]" />
      ) : (
        <div className="chrome-text font-display font-black text-2xl">V</div>
      )}
      {showText && (
        <span className="font-display font-black tracking-widest text-lg uppercase chrome-text hidden sm:block">
          Vertex<span className="text-muted-foreground font-normal">Studio</span>
        </span>
      )}
    </Link>
  );
}
