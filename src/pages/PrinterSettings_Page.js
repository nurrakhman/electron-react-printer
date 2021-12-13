import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Grid, Radio, RadioGroup, FormControl, FormControlLabel, Button } from "@material-ui/core";
import HeaderCom from "../components/Header_Com";
import "../styles/Settings_Styles.css";

const { remote } = require("electron");
const { ipcRenderer } = require("electron");

export default function PrinterSettings() {

    const history = useHistory();
    const [activePrinter, setActivePrinter] = useState(null);
    const [printerList, setPrinterList] = useState([]);

    useEffect(() => {
        // Get list of paired printers
        let webContents = remote.getCurrentWebContents();
        let printers = webContents.getPrinters();
        let result = [];
        printers.forEach(res => {
            result.push(res.name);
        })
        setPrinterList(result);
        // Set current active printer
        const currPrinter = ipcRenderer.sendSync('get-printer');
        if ( currPrinter ) setActivePrinter(currPrinter);
    }, []);

    const changePrinter = (e) => {
        setActivePrinter(e.target.value);
        ipcRenderer.sendSync('set-printer', e.target.value);
    }

    return (
        <Grid container className="settings-container">
            <Grid item xs={12}>
                <HeaderCom title="Pengaturan Printer" />
                <Grid container>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={6} className="settings-content">
                        <h4>Daftar printer yang terhubung :</h4>
                        <FormControl component="fieldset">
                            <RadioGroup
                                aria-label="printers"
                                name="list-of-printer"
                                value={activePrinter}
                                onChange={changePrinter}
                            >
                                {printerList.length > 0 && printerList.map((res, idx) => {
                                    return (
                                        <FormControlLabel
                                            key={`res_${idx}`}
                                            value={res}
                                            control={<Radio />}
                                            label={res}
                                        />
                                    )
                                })}
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}></Grid>
                </Grid>
                {/* <Grid container>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="contained"
                            className="modal-cancel-btn secondary-btn filled"
                            onClick={() => history.goBack()}
                        >
                            Kembali
                        </Button>
                    </Grid>
                    <Grid item xs={3}></Grid>
                </Grid> */}
            </Grid>
        </Grid>
    )
}
