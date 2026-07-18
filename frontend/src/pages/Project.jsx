import {useParams} from "react-router-dom";

function Project() {
    const {projectId} = useParams();
    return <h1>Project Page - {projectId}</h1>;
}

export default Project;