import { useState } from "react";
import { Link } from "react-router-dom";

import searchService from "../services/searchService";

function SearchPage() {
  const [query, setQuery] = useState("");

  const [students, setStudents] =
    useState([]);

  const [posts, setPosts] =
    useState([]);

  const [collaborations, setCollaborations] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSearch = async (
    event
  ) => {
    event.preventDefault();

    const searchTerm = query.trim();

    if (!searchTerm) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const [
        studentResults,
        postResults,
        collaborationResults,
      ] = await Promise.all([
        searchService.searchStudents(
          searchTerm
        ),
        searchService.searchPosts(
          searchTerm
        ),
        searchService.searchCollaborations(
          searchTerm
        ),
      ]);

      setStudents(studentResults);
      setPosts(postResults);
      setCollaborations(
        collaborationResults
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Search CampusConnect
        </h1>

        <p className="mt-2 text-slate-500">
          Discover students, posts, and
          collaborations.
        </p>

      </div>

      <form
        onSubmit={handleSearch}
        className="flex gap-3"
      >

        <input
          type="text"
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          placeholder="Search students, posts, collaborations..."
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading
            ? "Searching..."
            : "Search"}
        </button>

      </form>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {!loading &&
        searched &&
        students.length === 0 &&
        posts.length === 0 &&
        collaborations.length === 0 && (
          <div className="mt-10 text-center text-slate-500">
            No results found for "
            {query}".
          </div>
        )}

      {students.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Students ({students.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {students.map((student) => (
              <Link
                key={student._id}
                to={`/app/profile/${student._id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={student.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                      👤
                    </div>
                  )}

                  <div>

                    <h3 className="font-semibold text-slate-800">
                      {student.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {student.university}
                    </p>

                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-600">
                    {student.course}
                  </p>

                  {student.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">

                      {student.skills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600"
                          >
                            {skill}
                          </span>
                        ))}

                    </div>
                  )}

                </div>

              </Link>
            ))}

          </div>

        </section>
      )}

      {posts.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Posts ({posts.length})
          </h2>

          <div className="space-y-4">

            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/app/posts/${post._id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >

                <div className="flex items-center gap-3">

                  {post.author?.profileImage ? (
                    <img
                      src={post.author.profileImage}
                      alt={post.author.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      👤
                    </div>
                  )}

                  <div>

                    <h3 className="font-medium text-slate-800">
                      {post.author?.name}
                    </h3>

                    <p className="text-xs text-slate-400">
                      {new Date(
                        post.createdAt
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

                <p className="mt-4 text-slate-700">
                  {post.content}
                </p>

              </Link>
            ))}

          </div>

        </section>
      )}

      {collaborations.length > 0 && (
        <section className="mt-10">

          <h2 className="mb-4 text-xl font-bold text-slate-800">
            Collaborations (
            {collaborations.length})
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {collaborations.map(
              (collaboration) => (
                <Link
                  key={collaboration._id}
                  to={`/app/collaborations/${collaboration._id}`}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >

                  <h3 className="text-lg font-semibold text-slate-800">
                    {collaboration.title}
                  </h3>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {collaboration.description}
                  </p>

                  {collaboration.requiredSkills
                    ?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">

                      {collaboration.requiredSkills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600"
                          >
                            {skill}
                          </span>
                        ))}

                    </div>
                  )}

                </Link>
              )
            )}

          </div>

        </section>
      )}

    </div>
  );
}

export default SearchPage;