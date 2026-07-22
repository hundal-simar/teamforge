

import {
  useEffect,
} from "react";

import {
  useParams,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  fetchWorkspaceById,
  fetchWorkspaceMembers,
} from "../features/workspace/workspaceSlice";

function Workspace() {

  const dispatch =
    useDispatch();

  const {
    workspaceId,
  } = useParams();

  const {
    currentWorkspace,
    members,
    loading,
  } = useSelector(
    (state) =>
      state.workspace
  );

  useEffect(() => {

    dispatch(
      fetchWorkspaceById(
        workspaceId
      )
    );

    dispatch(
      fetchWorkspaceMembers(
        workspaceId
      )
    );

  }, [
    dispatch,
    workspaceId,
  ]);

  if (loading)
    return <p>Loading...</p>;

  return (
    <div>

      <h1>
        {
          currentWorkspace?.name
        }
      </h1>

      <h2>
        Members
      </h2>

      {members.map(
        (member) => (
          <div
            key={
              member.user._id
            }
          >
            <p>
              {
                member.user
                  .name
              }
            </p>

            <p>
              {
                member.role
              }
            </p>
          </div>
        )
      )}

    </div>
  );
}

export default Workspace;