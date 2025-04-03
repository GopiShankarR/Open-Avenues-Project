import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onValue, ref } from 'firebase/database';
import { update as updateAllCharactersData } from './slices/allCharactersSlice';
import { firebaseDatabase } from '../firebase/firebase';

const FirebaseListener = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const charactersRef = ref(firebaseDatabase, 'users/');

        const unsubscribe = onValue(charactersRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            if (data) {
                dispatch(updateAllCharactersData(data));
            }
        });

        return unsubscribe;
          
    }, [dispatch]);

    return null;
};

export default FirebaseListener;
