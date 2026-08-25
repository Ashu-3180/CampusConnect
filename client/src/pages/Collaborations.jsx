import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import collaborationService from "../services/collaborationService";
import CollaborationCard from "../components/collaborations/CollaborationCard";

function Collaborations() {
  const [collaborations, setCollaborations] =
    useState([]);

  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  const loadCollaborations = async (
    searchValue = "",
    skillValue = ""
  ) => {
    try {
      setLoading(true);

      const data =
        await collaborationService.getCollaborations(
          searchValue,
          skillValue
        );

      setCollaborations(
        data.collaborations
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborations();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCollaborations(
        search,
        skill
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [search, skill]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Collaborate
          </h1>

          <p className="mt-1 text-slate-500">
            Find teammates and build amazing projects together.
          </p>
        </div>

        <Link
          to="/app/collaborations/create"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-center font-medium text-white hover:bg-indigo-700"
        >
          + Create Project
        </Link>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search projects..."
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
        />

        <input
          type="text"
          value={skill}
          onChange={(event) =>
            setSkill(event.target.value)
          }
          placeholder="Filter by skill..."
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
        />

      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500">
          Loading collaboration opportunities...
        </div>
      ) : collaborations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

          <h3 className="font-semibold text-slate-700">
            No collaborations found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try another search or create a new project.
          </p>

        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {collaborations.map(
            (collaboration) => (
              <CollaborationCard
                key={collaboration._id}
                collaboration={collaboration}
              />
            )
          )}

        </div>
      )}

    </div>
  );
}

export default Collaborations;