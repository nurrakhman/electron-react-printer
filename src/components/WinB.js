import React, { useEffect, useState } from "react";
const { remote } = require("electron");
const { ipcRenderer } = require('electron');

function WinB() {

    const [list, setList] = useState([]);

    useEffect( () => {
        
        ipcRenderer.on('update-data-label', (event, data) => { 
            console.log(data) 
            setList(list => [...list, data])
        });
                
    }, []);
  
    return (
      <div className="app">
        <h1>Test Tampilan User</h1>
        <p>
          Jumlah yang di click : {list.length}
        </p>
        {list.map((item,i) => <li key={i}>{item}</li>)}
      </div>
    );
}
export default WinB;
