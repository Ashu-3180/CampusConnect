import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import userService from "../services/userService";

function Discover() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const data =
        await userService.getStudents(searchValue);

      setStudents(data.students);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStudents(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
          Discover Students
        </h1>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
          Find students, collaborators, and potential teammates.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search by name, university, course, or skills..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20 sm:px-5 sm:py-3"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 sm:p-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 sm:py-10">
          Finding students...
        </div>
      ) : students.length === 0 ? (

        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-10">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-lg dark:bg-indigo-500/10 sm:h-14 sm:w-14 sm:text-xl">
            👥
          </div>

          <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-white sm:mt-4 sm:text-base">
            No students found
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">
            Try searching for something else.
          </p>

        </div>

      ) : (

        /* Student grid */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

          {students.map((student) => {
            const initial = student.name
              ? student.name
                  .charAt(0)
                  .toUpperCase()
              : "U";

            return (
              <Link
                key={student._id}
                to={`/app/profile/${student._id}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20 sm:p-5"
              >

                {/* Student header */}
                <div className="flex items-center gap-3 sm:gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 sm:h-14 sm:w-14 sm:text-xl">
                    {initial}
                  </div>

                  <div className="min-w-0">

                    <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-white sm:text-base">
                      {student.name}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                      {student.course}
                    </p>

                  </div>

                </div>

                {/* University */}
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 sm:mt-4 sm:text-sm">
                  {student.university}
                </p>

                {/* Bio */}
                {student.bio && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300 sm:mt-3 sm:text-sm">
                    {student.bio}
                  </p>
                )}

                {/* Skills */}
                {student.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">

                    {student.skills
                      .slice(0, 4)
                      .map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300 sm:px-2.5 sm:text-xs"
                        >
                          {skill}
                        </span>
                      ))}

                  </div>
                )}

              </Link>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Discover;