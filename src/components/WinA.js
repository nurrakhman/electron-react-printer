import React, { Component } from "react";
const { PosPrinter } = require("electron").remote.require(
  "electron-pos-printer"
);
const { ipcRenderer } = require("electron");
const { remote } = require("electron");
const data = [
  {
    type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
    value: "SAMPLE HEADING",
    style: `text-align:center;`,
    css: { "font-weight": "700", "font-size": "18px" }
  },
  {
    type: "text", // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
    value: "Secondary text",
    style: `text-align:left;`,
    css: { "text-decoration": "underline", "font-size": "10px" }
  },
  {
    type: "barCode",
    value: "HB4587896",
    height: 12, // height of barcode, applicable only to bar and QR codes
    width: 1, // width of barcode, applicable only to bar and QR codes
    displayValue: true, // Display value below barcode
    fontsize: 8
  },
  {
    type: "qrCode",
    value: "https://github.com/Hubertformin/electron-pos-printer",
    height: 55,
    width: 55,
    style: "margin: 10 20px 20 20px"
  },
  {
    type: "table",
    // style the table
    style: "border: 1px solid #ddd",
    // list of the columns to be rendered in the table header
    tableHeader: ["Animal", "Age"],
    // multi dimensional array depicting the rows and columns of the table body
    tableBody: [
      ["Cat", 2],
      ["Dog", 4],
      ["Horse", 12],
      ["Pig", 4]
    ],
    // list of columns to be rendered in the table footer
    tableFooter: ["Animal", "Age"],
    // custom style for the table header
    tableHeaderStyle: "background-color: #000; color: white;",
    // custom style for the table body
    tableBodyStyle: "border: 0.5px solid #ddd",
    // custom style for the table footer
    tableFooterStyle: "background-color: #000; color: white;"
  }
];

const options = {
  preview: false, // Preview in window or print
  width: "170px", //  width of content body
  margin: "0 0 0 0", // margin of content body
  copies: 1, // Number of copies to print
  printerName: "RP58 Printer", // printerName: string, check it at webContent.getPrinters()
  timeOutPerLine: 400,
  silent: true
};

class WinA extends Component {
  render() {
    return (
      <div className="app">
        <h1>Research POS Printer Electron-React A</h1>
        <p>
          Research Kebutuhan print POS menggunakan Electron, Dengan React
          sebagai renderer
        </p>

        <button onClick={() => this.printerTest()}>Test Print</button>
        <br/> <br/>
         <button onClick={() => this.addData()}>Tambah data di tampilan user</button>
      </div>
    );
  }

  getPrinters() {
    let webContents = remote.getCurrentWebContents();
    let printers = webContents.getPrinters(); //list the printers
    console.log(printers);
  }

  printerTest() {
    PosPrinter.print(data, options)
      .then(() => {})
      .catch(error => {
        console.error(error);
      });
  }

  addData(){
      let data = Math.floor(Math.random() * 10)
       ipcRenderer.send('update-data-tampilan', data);
  }
}
export default WinA;
