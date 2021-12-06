import React, { Component } from 'react';
import { CircularProgress } from '@material-ui/core';
import '../styles/Loading_Styles.css';

class Spinner extends Component {
    render() {
        return (
            <div id="bg-spinner" style={{ opacity: this.props.isCalc? "0" : "initial" }}>
                <CircularProgress color="inherit" id="load-spinner" />
            </div>
        )
    }
}

export default Spinner;