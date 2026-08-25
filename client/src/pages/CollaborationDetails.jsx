import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import collaborationService from "../services/collaborationService";

function CollaborationDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [collaboration, setCollaboration] =
    useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const loadCollaboration = async () => {
    try {
      setLoading(true);

      const data =
        await collaborationService.getCollaborationById(
          id
        );

      setCollaboration(data.collaboration);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaboration();
  }, [id]);

  const handleApply = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      await collaborationService.applyToCollaboration(
        id,
        message
      );

      setMessage("");

      await loadCollaboration();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplication = async (
    applicationId,
    status
  ) => {
    try {
      await collaborationService.updateApplicationStatus(
        id,
        applicationId,
        status
      );

      await loadCollaboration();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleClose = async () => {
    try {
      await collaborationService.closeCollaboration(
        id
      );

      await loadCollaboration();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading project...
      </div>
    );
  }

  if (!collaboration) {
    return (
      <div className="py-10 text-center text-red-500">
        {error || "Collaboration not found"}
      </div>
    );
  }

  const isOwner =
    collaboration.owner?._id === user?._id;

  const isMember =
    collaboration.members.some(
      (member) =>
        member._id === user?._id
    );

  const userApplication =
    collaboration.applications.find(
      (application) =>
        application.applicant?._id === user?._id
    );

  const teamFull =
    collaboration.members.length >=
    collaboration.maxMembers;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {collaboration.title}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Created by{" "}
              {collaboration.owner?.name}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${
              collaboration.status === "open"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {collaboration.status}
          </span>

        </div>

        <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-600">
          {collaboration.description}
        </p>

        {collaboration.requiredSkills?.length >
          0 && (
          <div className="mt-6">

            <h3 className="mb-3 font-semibold">
              Required Skills
            </h3>

            <div className="flex flex-wrap gap-2">

              {collaboration.requiredSkills.map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600"
                  >
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>
        )}

        <div className="mt-6 border-t border-slate-100 pt-5">

          <h3 className="font-semibold text-slate-800">
            Team Members (
            {collaboration.members.length}/
            {collaboration.maxMembers})
          </h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            {collaboration.members.map(
              (member) => (
                <div
                  key={member._id}
                  className="rounded-lg bg-slate-50 p-3"
                >
                  <p className="font-medium text-slate-800">
                    {member.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {member.course}
                  </p>
                </div>
              )
            )}

          </div>

        </div>

      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* OWNER CONTROLS */}

      {isOwner &&
        collaboration.status === "open" && (
          <div className="flex justify-end">

            <button
              onClick={handleClose}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Close Collaboration
            </button>

          </div>
        )}

      {/* APPLY SECTION */}

      {!isOwner &&
        !isMember &&
        !userApplication &&
        collaboration.status === "open" &&
        !teamFull && (
          <form
            onSubmit={handleApply}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <h2 className="text-xl font-bold text-slate-900">
              Join this Project
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Introduce yourself and explain why you would be a good teammate.
            </p>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              maxLength="500"
              rows="4"
              placeholder="Example: I have experience with React and would love to contribute to the frontend..."
              className="mt-4 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting
                ? "Submitting..."
                : "Apply to Join"}
            </button>

          </form>
        )}

      {userApplication && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">

          <p className="font-medium text-indigo-700">
            Application Status:{" "}
            {userApplication.status}
          </p>

        </div>
      )}

      {isMember && !isOwner && (
        <div className="rounded-xl border border-green-100 bg-green-50 p-5 text-green-700">
          You are a member of this collaboration.
        </div>
      )}

      {/* OWNER APPLICATION MANAGEMENT */}

      {isOwner && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-900">
            Applications (
            {collaboration.applications.length})
          </h2>

          {collaboration.applications.length ===
          0 ? (
            <p className="mt-4 text-slate-500">
              No applications yet.
            </p>
          ) : (
            <div className="mt-5 space-y-4">

              {collaboration.applications.map(
                (application) => (
                  <div
                    key={application._id}
                    className="rounded-lg border border-slate-200 p-4"
                  >

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <h3 className="font-semibold text-slate-800">
                          {
                            application.applicant
                              ?.name
                          }
                        </h3>

                        <p className="text-sm text-slate-500">
                          {
                            application.applicant
                              ?.course
                          }
                        </p>

                      </div>

                      <span className="text-sm capitalize text-slate-500">
                        {application.status}
                      </span>

                    </div>

                    {application.message && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {application.message}
                      </p>
                    )}

                    {application.status ===
                      "pending" &&
                      collaboration.status ===
                        "open" && (
                        <div className="mt-4 flex gap-3">

                          <button
                            onClick={() =>
                              handleApplication(
                                application._id,
                                "accepted"
                              )
                            }
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              handleApplication(
                                application._id,
                                "rejected"
                              )
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                          >
                            Reject
                          </button>

                        </div>
                      )}

                  </div>
                )
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}

export default CollaborationDetails;