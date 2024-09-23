import './App.css'
import Header from './components/Header';
import ChatRoom from './components/ChatRoom';
import { useState } from 'react';

function App() {

	const [enter, setEnter] = useState(false);
	const [roomId, setRoomId] = useState("");

	const handleRoomEnterClick = (roomId: string): void => {
		setRoomId(roomId);
		setEnter(true);
	}

	return (
		<>
			<Header />

			{
				enter ? (
					<section className='flex justify-center flex-col items-center'>
					<ChatRoom roomId={roomId}/>
				</section>
				) : ""
			}

		</>
	)
}

export default App
