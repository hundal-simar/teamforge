import {useParams} from "react-router-dom";

function Workspace() {
    const {workspaceId} = useParams();
    return <h1>Workspace Page - {workspaceId}</h1>;
}

export default Workspace;