import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-monokai";
import "../css/Editor.css";

function Editor() {
  const { id: roomId } = useParams();
  const [output, setOutput] = useState(" ");
  const [input, setInput] = useState("Hello");
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
  
  string str;
  cin>>str;
  cout<<str;
  
  return 0;
}`);

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect("http://localhost:5000");

    socketRef.current.emit("join-room", roomId);

    socketRef.current.on("codeChanged1", (code) => {
      setCode(code);
    });

    socketRef.current.on("outputChanged1", (value) => {
      setOutput(value);
    });

    socketRef.current.on("inputChanged1", (value) => {
      setInput(value);
    });

    socketRef.current.on("recieve-output", (body) => {
      const output = body["output"];
      socketRef.current.emit("outputChanged", [output, roomId]);
      setOutput(body["output"]);
    });

    return () => socketRef.current.disconnect();
  }, [code, output]);

  const codeChanged = (code) => {
    socketRef.current.emit("codeChanged", [code, roomId]);
    setCode(code);
  };

  const inputChanged = (event) => {
    const val = event.target.value;
    socketRef.current.emit("inputChanged", [val, roomId]);
    setInput(event.target.value);
  };

  const outputChanged = () => {};

  const submitCode = (event) => {
    event.preventDefault();
    const body = {
      clientId: "e2e21cfc5d6236eb4a869c768c24e64f",
      clientSecret:
        "65189410b744a30068e3fdcc7ca083147bc103c2dc083309bb38dc157fb50c09",
      script: code,
      language: "cpp",
      versionIndex: "3",
      stdin: input,
    };
    socketRef.current.emit("submit-code", [body, roomId]);
  };

  return (
    <div>
      <p>Editor</p>
      <div className='editor'>
        <div className='code-editor'>
          <AceEditor
            mode='csharp'
            theme='monokai'
            fontSize={16}
            height='400px'
            width='800px'
            value={code}
            onChange={codeChanged}
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
        <div className='input-output-div'>
          <div className='input-div' style={{ display: "inline-block" }}>
            <p>Input</p>
            <textarea
              className='input'
              style={{ height: "100px", width: "200px" }}
              onChange={inputChanged}
              value={input}
            />
          </div>
          <div className='output-div' style={{ display: "inline-block" }}>
            <p>Output</p>
            <textarea
              className='output'
              style={{ height: "100px", width: "200px" }}
              onChange={outputChanged}
              value={output}
            />
          </div>
        </div>
      </div>
      <div>
        <button type='submit' onClick={submitCode}>
          Submit Code
        </button>
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
