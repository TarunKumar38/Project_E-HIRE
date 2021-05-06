import React, {useState, useRef, useEffect} from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";


function Editor() {
  const { id: roomId } = useParams();
	const [text, setText] = useState('');

  console.log(roomId);
	const socketRef = useRef();

	useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");
		
		socketRef.current.emit("join-room", roomId);
    socketRef.current.on("textChanged1", (text) => {
      setText(text);
    });
    return () => socketRef.current.disconnect();
  }, [text]);


	const textChanged = (event) => {
    event.preventDefault();
    socketRef.current.emit("textChanged", event.target.value);
    setText(event.target.value);
  };
	
  return (
    <div>
      Editor
      <div className='textarea'>
        <textarea
          className='editor'
          style={{ height: "300px", width: "500px" }}
          onChange={textChanged}
          value={text}
        />
      </div>
      <div>
        <p className='back' onClick={() => (window.location.href = "/")}>
          Back
        </p>
      </div>
    </div>
  );
}

export default Editor;
