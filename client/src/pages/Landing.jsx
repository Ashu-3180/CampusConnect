import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="flex w-full max-w-xl justify-center">
        <img
          src="/branding/campusconnect-logo.svg"
          alt="CampusConnect"
          className="h-16 w-auto max-w-full object-contain sm:h-20 md:h-24"
        />
      </h1>

      <p className="mt-4 max-w-xl text-lg text-slate-600">
        Connect with students, collaborate on projects, and discover
        opportunities.
      </p>

      <div className="mt-8 flex gap-4">
        <Link
          to="/register"
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          Get Started
        </Link>

        <Link
          to="/login"
          className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default Landing;