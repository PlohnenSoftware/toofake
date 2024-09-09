
import React from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import useCheck from '@/utils/check';
import s from './me.module.scss'
import l from '@/styles/loader.module.scss';
import Friend from '@/models/friend';
import Link from 'next/link';

export default function Me() {

    useCheck();

    let [username, setUsername] = React.useState<string>("");
    let [name, setName] = React.useState<string>("");
    let [bio, setBio] = React.useState<string>("");
    let [pfp, setPfp] = React.useState<string>("");
	let [joinDate, setJoined] = React.useState<string>("");
    let [location, setLocation] = React.useState<string>("");
    let [streak, setStreak] = React.useState<string>("");
    let [friends, setFriends] = React.useState<Friend[]>([]);
    let [friendsLoading, setFriendsLoading] = React.useState<boolean>(true);

    

    useEffect(() => {

        if (localStorage && JSON.parse(localStorage.getItem("myself")!)) {
            setUsername(JSON.parse(localStorage.getItem("myself")!).username);
            setName(JSON.parse(localStorage.getItem("myself")!).fullname);
            setBio(JSON.parse(localStorage.getItem("myself")!).biography);
			setPfp(JSON.parse(localStorage.getItem("myself")!).profilePicture != undefined ? JSON.parse(localStorage.getItem("myself")!).profilePicture.url : "");
        }

        let token = localStorage.getItem("token");
        let body = JSON.stringify({ "token": token });
        let options = {
            url: "/api/me",
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: body,
        }

        axios.request(options).then(
            (response) => {
                console.log("resp me", response.data);
                setUsername(response.data.username);
                setName(response.data.fullname);
                setBio(response.data.biography);
                setPfp(response.data.profilePicture != undefined ? response.data.profilePicture.url : "");
				setLocation(response.data.location ?? "");
				setStreak(response.data.streakLength ?? "")
				setJoined(new Date(response.data.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ', ' + new Date(response.data.createdAt).toLocaleTimeString());

            }
        ).catch(
            (error) => {
                console.log(error);
            }
        )

        let friend_options = {
            url: "/api/friends",
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: body,
        }

        axios.request(friend_options).then(
            async (response) => {
                console.log("resp friend", response.data);

                let raw_friends = response.data.data;
                let new_friends: Friend[] = [];

                async function createFriend(data: any) {
                    let newfriend = Friend.create(data);
                    new_friends.push(newfriend);
                    return newfriend;
                }

                for (let i = 0; i < raw_friends.length; i++) {
                    try {
                        await createFriend(raw_friends[i]);
                        setFriendsLoading(false);
                        setFriends([...new_friends]);
                    } catch (error) {
                        console.log("COULDNT MAKE FRIEND WITH DATA: ", raw_friends[i])
                        console.log(error);
                    }
                }

                console.log("new friends");
                console.log(new_friends);                
            }
        ).catch(
            (error) => {
                console.log(error);
            }
        )


    }, [])

    return (
        <div className={s.me}>
            <div className={s.card}>
                {pfp ? <img src={pfp} className={s.pfp} /> : <div className={s.pfp}>no profile picture</div>}
                <div className={s.details}>
                    <div className={s.detail}>
                        <div className={s.label}>username</div>
                        <div className={s.value}>{username}</div>
                    </div>
                    <div className={s.detail}>
                        <div className={s.label}>name</div>
                        <div className={s.value}>{name}</div>
                    </div>
                    {
                        bio && bio.length > 0 ?
                            <div className={s.detail}>
                                <div className={s.label}>biography</div>
                                <div className={s.value}>{bio}</div>
                            </div> : null
                    }
					{
                        location && location.length > 0 ?
                            <div className={s.detail}>
                                <div className={s.label}>location</div>
                                <div className={s.value}>{location}</div>
                            </div> : null
                    }
					<div className={s.detail}>
                        <div className={s.label}>date joined</div>
                        <div className={s.value}>{joinDate}</div>
                    </div>
					<div className={s.detail}>
                        <div className={s.label}>current streak</div>
                        <div className={s.value}>🔥 {streak} 🔥</div>
                    </div>
                </div>
            </div>
            <div className={s.divider}></div>
            <div className={s.friends}>
                <div className={s.title}>Friends ({friends.length})</div>
                    {
                        friendsLoading ? <div className={l.loader}></div> : 
                        friends.map((friend) => {
                            return (
                                <Link href={`/profile/${friend.uid}`} key={friend.uid}>
                                    <div className={s.friend} key={friend.uid}>
                                        <img alt="Profile" src={friend.pfp} className={s.pfp} />
                                        <div className={s.details}>
                                            <div className={s.username}>@{friend.username}</div>
                                            <div className={s.fullname}>{friend.fullname}</div>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })
                    }
            </div>
        </div>
    )
}