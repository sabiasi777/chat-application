import { useEffect, useState } from 'react'
import { useUserStore } from '../../../lib/userStore'
import './userInfo.css'
import Settings from '../chatList/settings/Settings'

const Userinfo = () => {

    const { currentUser } = useUserStore()
    const [settings, setSettings] = useState(false)

    return(
        <div className='userInfo'>
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="icons">
                <img src="./more.png" alt="" onClick={()=>setSettings(!settings)} />
                <img src="./video.png" alt="" />
                <img src="./edit.png" alt="" />
            </div>
            { settings && <Settings />}
        </div>
    )
}

export default Userinfo