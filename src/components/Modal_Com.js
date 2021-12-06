import React, { useState } from "react";
import MuiAlert from '@material-ui/lab/Alert';
import { NavLink, useHistory } from "react-router-dom";
import { Modal, Button, Grid, CircularProgress, Snackbar } from "@material-ui/core";
import { getSalesData } from "../logic/APIHandler";
import "../styles/Modal_Styles.css";

const { ipcRenderer } = window.require('electron')

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function CustomModal(props) {

    const history = useHistory();
    const [isLoading, setIsLoading] = useState(false);
    const [openSuccessAlert, setOpenSuccessAlert] = useState(false);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [alertText, setAlertText] = useState('');

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        const token = ipcRenderer.sendSync('get-token');
        let resp = await getSalesData(token);
        if ( resp[0] && resp[0].status === 200 ) {
            ipcRenderer.sendSync('store-data', JSON.stringify(resp[0].data));
            setAlertText('Berhasil memuat ulang data.');
            setOpenSuccessAlert(true);
            await sleep(1500);
            if ( history.location.pathname === "/penjualan" ) {
                history.go(0);
            }
            else {
                history.replace("/penjualan");
            }
        }
        else {
            setAlertText('Gagal memuat data. Silakan coba lagi.');
            setOpenErrorAlert(true);
            setIsLoading(false);
        }
    }

    // HTML for Modal
    const modalBody = (
        <div className="modal-body">
            <h2 id="modal-title" className={props.titleClassName}>
                {props.modalTitle}
            </h2>
            <form className="custom-form">
                <p>{props.subtitle}</p>
                {/* Button Action Section */}
                {props.modalType === "handle-jwt"?
                    <NavLink to="/" style={{ textDecoration: "none" }}>
                        <Button
                            onClick={() => ipcRenderer.sendSync('clear-storage')}
                            variant="contained"
                            className="primary-btn center-align"
                        >
                            Login Kembali
                        </Button>
                    </NavLink>
                    : <Grid container style={{ marginTop: "30px" }}>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                className="modal-submit-btn primary-btn"
                                onClick={handleSubmit}
                            >
                                {isLoading?
                                    <CircularProgress color="inherit" size={24} />
                                    : props.submitText
                                }
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="outlined"
                                className="modal-cancel-btn secondary-btn"
                                onClick={props.onClickCancel}
                            >
                                {props.cancelText}
                            </Button>
                        </Grid>
                    </Grid>
                }
            </form>
        </div>
    );

    return (
        <>
            <Snackbar open={openSuccessAlert} autoHideDuration={2500} onClose={() => setOpenSuccessAlert(false)}>
                <Alert severity="success">
                    {alertText}
                </Alert>
            </Snackbar>
            <Snackbar open={openErrorAlert} autoHideDuration={2500} onClose={() => setOpenErrorAlert(false)}>
                <Alert severity="error">
                    {alertText}
                </Alert>
            </Snackbar>
            <Modal
                open={props.open}
                onClose={props.onClose}
                className="custom-modal"
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
            >
                {modalBody}
            </Modal>
        </>
    );
}