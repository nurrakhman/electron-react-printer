import "babel-polyfill";
import React, { useState } from "react";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { Container, Grid, TextField, Button, InputAdornment,
    IconButton, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Spinner from '../components/Loading_Com';
import { hitLogin } from '../logic/APIHandler';
import logo from '../../assets/logo.png';
import '../styles/Login_Styles.css';

const { ipcRenderer } = require('electron')

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function LoginPage() {

    const history = useHistory();
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Page State
    const [isLoading, setIsLoading] = useState(false);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [alertText, setAlertText] = useState('');

    const handleLogin = async () => {
        setIsLoading(true);
        let message = "";
        let canLogin = false;
        if ( email && password ) {
            if ( emailRegex.test(email) ) {
                const resp = await hitLogin(email, password);
                if ( resp[0] && resp[0].status === 200 ) {
                    const user = resp[0].data;
                    if ( user.jobdesk === "kasir" ) {
                        canLogin = true;
                        ipcRenderer.sendSync('store-token', user.token);
                    }
                    else {
                        message = "User selain kasir tidak dapat login di aplikasi ini.";
                    }
                }
                else if ( resp[1] && resp[1].status === 501 ) {
                    message = "Network Error. Cek kembali jaringan internet Anda.";
                }
                else if ( resp[1] && resp[1].status === 400 ) {
                    message = "Wrong password.";
                }
                else if ( resp[1] && resp[1].status === 404 ) {
                    message = "User not found.";
                }
                else {
                    message = resp[1].message;
                }
            }
            else {
                message = "Format email belum benar.";
            }
        }
        else {
            message = "Email dan Password harus diisi!";
        }
        if ( !canLogin ) {
            setAlertText(message);
            setOpenErrorAlert(true);
            setIsLoading(false);
        }
        else {
            history.push("/penjualan");
        }
    }

    return (
        <Container className="login-container">
            { isLoading ? ( <Spinner /> ) : "" }
            <Snackbar open={openErrorAlert} autoHideDuration={2500} onClose={() => setOpenErrorAlert(false)}>
                <Alert severity="error">
                    {alertText}
                </Alert>
            </Snackbar>
            <Grid container>
                <Grid item xs={12}>
                    <form id="login-form">
                        <img src={logo} alt="logo" className="login-logo" />
                        <TextField
                            type="email"
                            label="Email"
                            placeholder="Email"
                            className="login-input"
                            value={email}
                            onChange={e => {
                                if ( !e.target.value.includes(" ") )
                                    setEmail(e.target.value)
                            }}
                        />
                        <TextField
                            type={showPassword ? "text" : "password"}
                            label="Password"
                            placeholder="Password"
                            className="login-input"
                            value={password}
                            onChange={e => {
                                if ( !e.target.value.includes(" ") )
                                    setPassword(e.target.value)
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword? <Visibility/> : <VisibilityOff/>}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            variant="contained"
                            className="primary-btn full-btn login-btn"
                            onClick={handleLogin}
                        >
                            LOGIN
                        </Button>
                    </form>
                </Grid>
            </Grid>
        </Container>
    )
}
