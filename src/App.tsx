import './App.css'
import { useEffect, useState } from 'react'
import axios from 'axios';

import * as StompJs from "@stomp/stompjs";

interface Room {
	roomId: string,
	roomName: string
}


function App() {

	const [inputValue, setInputValue] = useState("");
	const [rooms, setRooms] = useState<Room[]>([]);
	const [client, setClient] = useState<StompJs.Client>();

	useEffect(() => {
		fetchRooms();
	}, [])

	const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value)
	}

	const handleCreateButtonClick = async () => {
		const response = await axios.post("/api/rooms", {roomName: inputValue});

		if(response.status === 201) {
			fetchRooms();
		}
	}

	const fetchRooms = async () => {
		const response = await axios.get('/api/rooms');
		setRooms([...response.data])
	}


  const connect = (roomId: string) => {
    // 소켓 연결
    try {
      const clientdata = new StompJs.Client({
        brokerURL: "ws://localhost:8888/ws/stomp",
        connectHeaders: {
          token: "",
        },
        debug: function (str) {
          console.log(str);
        },
        reconnectDelay: 5000, // 자동 재 연결
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

			clientdata.onConnect = () => {

				enterRoom(roomId)

				clientdata.subscribe(`/sub/chat/room/${roomId}`, (message) => {
					console.log(message)
				})
			}

			clientdata.activate(); 

			setClient(clientdata)

    } catch (err) {
      console.log(err);
    }
  };

	const enterRoom = (roomId: string) => {
		client?.publish({
			destination: "/pub/chat/enter/" + roomId,
      body: JSON.stringify({
        type: "",
        sender: "tester",
        channelId: "1",
        data: "",
      }),
		})
	}

	const sendMessage = (roomId: string) => {
		client?.publish({
			destination: "/pub/chat/message/" + roomId,
      body: JSON.stringify({
        type: "",
        sender: "tester",
        channelId: "1",
        data: "",
      }),
		})
	}

	return (
		<>
			<div className='w-full h-full flex flex-col justify-center pt-5'>
				<div className='flex justify-center'>
					<input className='border border-black mr-2 rounded-lg px-2' value={inputValue} onChange={handleInput}/>
					<div className='border border-black px-2 rounded-md hover:bg-gray-300 cursor-pointer'
						onClick={handleCreateButtonClick}				
					>
						방만들기
					</div>
				</div>
				<div className='p-5'>
					<div className='border'>
						<div>방리스트</div>

						{
							rooms.map( room => (
								<div key={room.roomId} className='cursor-pointer hover:bg-slate-300'
									onClick={() => connect(room.roomId)}
								>
									{room.roomName}
								</div>
							))
						}
					</div>
				</div>


				<div className='p-5'>

					<div className='border'>

						<div>
							<span>채팅방</span>
							<span> 제목: </span>
						</div>

						<div>
							내용들
						</div>

					</div>

				</div>

			</div>
		</>
	)
}

export default App
