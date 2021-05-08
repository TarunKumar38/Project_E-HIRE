import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/theme-tomorrow";

function Editor() {
  const { id: roomId } = useParams();
  const [text, setText] = useState(`#include <iostream>
using namespace std;

int main() {
  
  cout<<"Hello There";
  
  return 0;
}`);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");

    socketRef.current.emit("join-room", roomId);
    socketRef.current.on("textChanged1", (text) => {
      setText(text);
    });
    return () => socketRef.current.disconnect();
  }, [text]);

  const textChanged = (value) => {
    socketRef.current.emit("textChanged", value);
    setText(value);
  };

  return (
    <div>
      Editor
      <div className='textarea'>
        <AceEditor
          mode='csharp'
          theme='tomorrow'
          fontSize={20}
          height='500px'
          width='600px'
          value={text}
          onChange={textChanged}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={true}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            tabSize: 4,
          }}
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
