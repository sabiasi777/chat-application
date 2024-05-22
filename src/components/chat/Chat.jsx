import { useEffect, useRef, useState } from 'react'
import './chat.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from '../../lib/userStore'
import { upload } from '../../lib/upload'
import moment from 'moment'

const Chat = () => {
    const [open, setOpen] = useState(false)
    const [chat, setChat] = useState()
    const [text, setText] = useState('')
    const [img, setImg] = useState({
        file: null,
        url: ''
    })
    const [send, setSend] = useState(false)

    const { currentUser } = useUserStore()
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore()

    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatId, send])

    useEffect(() => {
        const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
            setChat(res.data())
        })

        return () => {
            unSub()
        }
    }, [chatId])

    const handleEmoji = (e) => {
        setText(prev=>prev+e.emoji);
        setOpen(false)
    }

    const handleImg = (e) => {
        if (e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleSend = async () => {
        if(text === '' && img.file===null) return;

        let imgUrl = null;

        try{

            if(img.file) {
                imgUrl = await upload(img.file)
            }
            await updateDoc(doc(db, 'chats', chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    ...(imgUrl && {img: imgUrl})
                })
            })

            const userIDs = [currentUser.id, user.id]
            
            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, 'userchats', id)
                const userChatsSnapshot = await getDoc(userChatsRef)
            
                if(userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data()

                    const chatIndex = userChatsData.chats.findIndex(c=>c.chatId === chatId)

                    userChatsData.chats[chatIndex].lastMessage = text ? text : 'photo'
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now()

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats
                    })
                }
            })
        }catch(err){
            console.log(err);
        }finally{
            setImg({
            file: null,
            url: ''
        })
        setSend(prev=>!prev);
        setText('')
        }
    }

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor, sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={message.senderId === currentUser?.id ? 'message own' : 'message'} key={message?.createdAt}>
                    <div className="texts">
                        {message.img && <img src={message.img} alt="" />}
                        {message.text && <p>{message.text}</p>}
                        <span>{moment(message.createdAt).fromNow()}</span>
                    </div>
                </div>
                ))
                }
                {img.url && (<div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>)}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file" >
                        <img src="./img.png" alt="" />
                    </label>
                    <input type="file" id='file' style={{display: 'none'}} onChange={handleImg} disabled={isCurrentUserBlocked || isReceiverBlocked} />
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input
                type="text"
                placeholder={isCurrentUserBlocked || isReceiverBlocked ? 'You cannot send a message' : 'Type a message...'}
                value={text}
                onChange={e=>setText(e.target.value)}
                disabled={isCurrentUserBlocked || isReceiverBlocked} />
                <div className="emoji">
                    <img src="./emoji.png" alt="" onClick={()=>setOpen(prev=>!prev)} />
                    <div className="picker" >
                        <EmojiPicker 
                        open={open && !(isCurrentUserBlocked || isReceiverBlocked)}
                        onEmojiClick={handleEmoji}
                        skinTonesDisabled={isCurrentUserBlocked || isReceiverBlocked}
                        lazyLoadEmojis={isCurrentUserBlocked || isReceiverBlocked}
                        searchDisabled={isCurrentUserBlocked || isReceiverBlocked}
                        reactionsDefaultOpen={isCurrentUserBlocked || isReceiverBlocked}
                        allowExpandReactions={isCurrentUserBlocked || isReceiverBlocked}
                        emojiStyle='facebook'
                        />
                    </div>
                </div>
                <button className='sendButton' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
    )
}

export default Chat