import React from "react";
import { Grid, Button } from "@material-ui/core";
import HeaderCom from "../components/Header_Com";
import "../styles/Settings_Styles.css";

const { remote } = require("electron");
const { PosPrinter } = require("electron").remote.require(
    "electron-pos-printer"
);

export default function PrinterSettings() {

    const getPrinters = () => {
        let webContents = remote.getCurrentWebContents();
        let printers = webContents.getPrinters(); //list the printers
    }

    return (
        <Grid container className="settings-container">
            <Grid item xs={12}>
                <HeaderCom title="Pengaturan Printer" />
                <Grid container>
                    <Grid item xs={3}></Grid>
                    <Grid item xs={6} className="settings-content">
                        <Grid container>
                            <Grid item xs={6} className="left-section">
                                <h4>Koneksi Printer</h4>
                            </Grid>
                            <Grid item xs={6} className="right-section">
                                <span>-</span>
                            </Grid>
                            <Grid item xs={6} className="left-section">
                                <h4>Sambungkan Printer?</h4>
                            </Grid>
                            <Grid item xs={6} className="right-section">
                                <Button
                                    variant="contained"
                                    className="primary-btn"
                                >
                                    SAMBUNGKAN
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={3}></Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
