import {useState, useEffect, createContext,useContext} from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    
        const fetchUser = async ()=>{
            try{
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };

    useEffect(()=>{
        fetchUser();
    },[]);

    const login = async (credentials)=>{
        try{
            const response = await api.post('/auth/login', credentials);
            await fetchUser(); // Fetch user data after successful login
            setUser(response.data);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (userData)=>{
        try{
            const response = await api.post('/auth/register', userData);
            await fetchUser(); // Fetch user data after successful registration
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async ()=>{
        try{
            await api.post('/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;