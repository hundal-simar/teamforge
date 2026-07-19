import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";

const LogoutButton = () => {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default LogoutButton;