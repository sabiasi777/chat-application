import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { create } from "zustand";

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) return set({currentUser:null, isLoading: false});
    
    try{
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()) {
            set({currentUser: docSnap.data(), isLoading: false})
        }else{
            set({currentUser: null, isLoading: false})
        }
    }catch(err){
        console.log(err.message);
        set({currentUser:null, isLoading: false});
    }
  }
}))