

import { useState } from "react";

import {
  useDispatch,
} from "react-redux";

import {
  addWorkspace,
} from "../features/workspace/workspaceSlice";

function CreateWorkspaceModal({
  onClose,
}) {

  const dispatch =
    useDispatch();

  const [name, setName] =
    useState("");

  const submitHandler =
    async (e) => {

      e.preventDefault();

      await dispatch(
        addWorkspace({
          name,
        })
      );

      onClose();
    };

  return (
    <div>

      <form
        onSubmit={
          submitHandler
        }
      >

        <input
          type="text"
          value={name}
          placeholder="Workspace Name"
          onChange={(e) =>
            setName(
              e.target.value
            )
          }
        />

        <button
          type="submit"
        >
          Create
        </button>

      </form>

    </div>
  );
}

export default CreateWorkspaceModal;