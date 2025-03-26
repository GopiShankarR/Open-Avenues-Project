import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onValue, ref } from 'firebase/database';
import { update as updateAllCharactersData } from './slices/allCharactersSlice';
import { db } from '../firebase/firebase';

const FirebaseListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const charactersRef = ref(db, 'characters/');

        const unsubscribe = onValue(charactersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                dispatch(updateAllCharactersData(data));
            }
        });

        
    }, [dispatch]);

    return null;
};

export default FirebaseListener;
