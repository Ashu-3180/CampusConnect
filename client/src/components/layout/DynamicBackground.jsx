/**
 * Soft, slow-moving abstract backdrop for the authenticated app shell.
 * Self-contained styles so it can ship without touching global CSS.
 */
function DynamicBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <style>{`
        .cc-dynamic-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 255, 255, 0.72) 0%, transparent 70%),
            radial-gradient(ellipse 55% 45% at 12% 18%, rgba(125, 211, 252, 0.45) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 88% 22%, rgba(167, 139, 250, 0.38) 0%, transparent 55%),
            radial-gradient(ellipse 45% 50% at 78% 78%, rgba(244, 114, 182, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 45% at 18% 82%, rgba(99, 102, 241, 0.28) 0%, transparent 55%),
            linear-gradient(160deg, #e8f4ff 0%, #eef2ff 42%, #f5f3ff 72%, #faf5ff 100%);
        }

        .dark .cc-dynamic-bg {
          background:
            radial-gradient(ellipse 70% 55% at 50% 38%, rgba(15, 23, 42, 0.55) 0%, transparent 68%),
            radial-gradient(ellipse 50% 42% at 10% 16%, rgba(56, 189, 248, 0.16) 0%, transparent 58%),
            radial-gradient(ellipse 48% 40% at 90% 20%, rgba(129, 140, 248, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 42% 48% at 80% 80%, rgba(192, 132, 252, 0.14) 0%, transparent 55%),
            radial-gradient(ellipse 48% 42% at 16% 84%, rgba(67, 56, 202, 0.28) 0%, transparent 55%),
            linear-gradient(160deg, #0b1224 0%, #111827 40%, #1e1b4b 75%, #1a1033 100%);
        }

        .cc-dynamic-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(72px);
          will-change: transform;
          animation: cc-blob-drift 48s ease-in-out infinite;
        }

        .cc-dynamic-blob--a {
          top: -12%;
          left: -8%;
          width: min(52vw, 420px);
          height: min(52vw, 420px);
          background: rgba(56, 189, 248, 0.35);
          animation-duration: 52s;
        }

        .cc-dynamic-blob--b {
          top: 8%;
          right: -10%;
          width: min(48vw, 380px);
          height: min(48vw, 380px);
          background: rgba(129, 140, 248, 0.32);
          animation-duration: 58s;
          animation-direction: reverse;
        }

        .cc-dynamic-blob--c {
          bottom: -14%;
          left: 18%;
          width: min(56vw, 460px);
          height: min(56vw, 460px);
          background: rgba(167, 139, 250, 0.28);
          animation-duration: 64s;
          animation-delay: -12s;
        }

        .cc-dynamic-blob--d {
          bottom: 10%;
          right: 8%;
          width: min(36vw, 280px);
          height: min(36vw, 280px);
          background: rgba(244, 114, 182, 0.16);
          animation-duration: 46s;
          animation-direction: reverse;
          animation-delay: -8s;
        }

        .dark .cc-dynamic-blob--a {
          background: rgba(34, 211, 238, 0.14);
        }

        .dark .cc-dynamic-blob--b {
          background: rgba(99, 102, 241, 0.2);
        }

        .dark .cc-dynamic-blob--c {
          background: rgba(139, 92, 246, 0.16);
        }

        .dark .cc-dynamic-blob--d {
          background: rgba(192, 132, 252, 0.1);
        }

        .cc-dynamic-dots {
          position: absolute;
          inset: 0;
          opacity: 0.35;
          background-image:
            radial-gradient(circle at 18% 28%, rgba(99, 102, 241, 0.45) 0 1.5px, transparent 2px),
            radial-gradient(circle at 72% 18%, rgba(56, 189, 248, 0.4) 0 1.25px, transparent 2px),
            radial-gradient(circle at 84% 62%, rgba(167, 139, 250, 0.4) 0 1.5px, transparent 2px),
            radial-gradient(circle at 28% 74%, rgba(244, 114, 182, 0.3) 0 1.25px, transparent 2px),
            radial-gradient(circle at 52% 48%, rgba(129, 140, 248, 0.25) 0 1px, transparent 1.5px),
            radial-gradient(circle at 40% 16%, rgba(14, 165, 233, 0.3) 0 1px, transparent 1.5px);
        }

        .dark .cc-dynamic-dots {
          opacity: 0.22;
          background-image:
            radial-gradient(circle at 18% 28%, rgba(125, 211, 252, 0.5) 0 1.5px, transparent 2px),
            radial-gradient(circle at 72% 18%, rgba(165, 180, 252, 0.45) 0 1.25px, transparent 2px),
            radial-gradient(circle at 84% 62%, rgba(196, 181, 253, 0.4) 0 1.5px, transparent 2px),
            radial-gradient(circle at 28% 74%, rgba(232, 121, 249, 0.28) 0 1.25px, transparent 2px),
            radial-gradient(circle at 52% 48%, rgba(129, 140, 248, 0.3) 0 1px, transparent 1.5px),
            radial-gradient(circle at 40% 16%, rgba(56, 189, 248, 0.35) 0 1px, transparent 1.5px);
        }

        .cc-dynamic-curve {
          position: absolute;
          border: 1px solid rgba(129, 140, 248, 0.18);
          border-radius: 50%;
          opacity: 0.55;
        }

        .dark .cc-dynamic-curve {
          border-color: rgba(165, 180, 252, 0.12);
          opacity: 0.4;
        }

        .cc-dynamic-curve--a {
          top: 12%;
          left: -6%;
          width: min(42vw, 340px);
          height: min(42vw, 340px);
        }

        .cc-dynamic-curve--b {
          right: -4%;
          bottom: 18%;
          width: min(36vw, 280px);
          height: min(36vw, 280px);
          border-color: rgba(56, 189, 248, 0.16);
        }

        .dark .cc-dynamic-curve--b {
          border-color: rgba(34, 211, 238, 0.1);
        }

        @keyframes cc-blob-drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(3%, 4%, 0) scale(1.06);
          }
          66% {
            transform: translate3d(-2.5%, -3%, 0) scale(0.96);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-dynamic-blob {
            animation: none;
          }
        }
      `}</style>

      <div className="cc-dynamic-bg" />

      <div className="cc-dynamic-blob cc-dynamic-blob--a" />
      <div className="cc-dynamic-blob cc-dynamic-blob--b" />
      <div className="cc-dynamic-blob cc-dynamic-blob--c" />
      <div className="cc-dynamic-blob cc-dynamic-blob--d" />

      <div className="cc-dynamic-curve cc-dynamic-curve--a" />
      <div className="cc-dynamic-curve cc-dynamic-curve--b" />

      <div className="cc-dynamic-dots" />
    </div>
  );
}

export default DynamicBackground;
