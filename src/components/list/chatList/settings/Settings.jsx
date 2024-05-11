import { useEffect, useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import './settings.css'
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";
import { upload } from "../../../../lib/upload";

const Settings = () => {
    const { currentUser } = useUserStore()
    const [text, setText] = useState('')
    const [avatar, setAvatar] = useState({
        file: null,
        url: ''
    })
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        let imgUrl = currentUser.avatar;
        const updatedUserData = {};

        if (avatar.file) {
            imgUrl = await upload(avatar.file);
            updatedUserData.avatar = imgUrl;
        }

        if (text.trim() !== '') {
            updatedUserData.username = text.trim();
        } else {
            updatedUserData.username = currentUser.username;
        }

        await updateDoc(doc(db, 'users', currentUser.id), updatedUserData);

        toast.success('Profile Changed, please refresh the page to see changes!');
    } catch (err) {
        toast.error(err.message);
    }finally{
        setLoading(false)
    }
};


    const handleChange = (e) => {
        setText(e.target.value)
    }

    

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
            })
        }
        
    }

    return (
        <div className="Profile">
            <div className="profile">
                <div className="right">
                    <label htmlFor="file">
                        <img src={avatar.url ? avatar.url : currentUser.avatar} alt="" />
                    </label>
                    <input type="file" id="file" style={{display:'none'}} onChange={handleAvatar} />
                    <span>Change your Avatar</span>
                </div>
                <div className="left">
                    <h1>My Profile</h1>
                    <input
                    type="text"
                    name="username"
                    placeholder={`Change Your Name ${currentUser.username}`}
                    value={text}
                    onChange={handleChange}
                    />
                </div>
                <div className="bottom">
                    <button onClick={handleUpdate} disabled={loading} >{loading ? 'Updating' : 'Update'}</button>
                </div>
            </div>
        </div>
    )
}

export default Settings;