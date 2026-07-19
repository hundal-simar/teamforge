import {useNavigate} from 'react-router-dom';
import {useContext} from 'react';
import {AuthContext} from '../context/AuthContext';

const ProtectedRoute = ({children})=>{
    const {user, loading} = useContext(AuthContext);
    const navigate = useNavigate();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        navigate("/login");
        return null;
    }

    return children;
};

export default ProtectedRoute;