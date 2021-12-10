import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import {
    List, ListItem, ListItemText, ListSubheader,
    ListItemIcon, SwipeableDrawer
} from '@material-ui/core';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import PrinterIcon from '@material-ui/icons/Print';
import LaunchIcon from '@material-ui/icons/Launch';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import logo from '../../assets/logo.png';
import CustomModal from './Modal_Com';
import '../styles/Sidebar_Styles.css';

const { ipcRenderer } = window.require('electron')

class SwipeableDrawer_Com extends Component {

  constructor(props) {
    super(props);
    
    const currLocation = props.location.pathname;
    const currID = props.match.params.id;

    this.state = {
      id: (currID? currID : ""),
      currLocation: currLocation,
      openModal: false,
    }
  }

  // Maintain sidebar active menu to stay active in different pages
  onPaths(paths) {
    return (match, location) => {
      return paths.includes(location.pathname);
    };
  };

  render() {
    return (
      <>
      <CustomModal
        open={this.state.openModal}
        modalType="ok-only"
        titleClassName="text-center"
        modalTitle="Halaman Preview Transaksi Masih Terbuka!"
        onClickCancel={() => this.setState({ openModal: false })}
      />
      <SwipeableDrawer
        anchor="left"
        id="sidebar"
        open={this.props.open}
        onClose={this.props.onClose}
        onOpen={this.props.onOpen}
      >
        <List
          dense
          subheader={
            <ListSubheader className="sidebar-header">
                <img src={logo} alt="logo" className="sidebar-logo" />
            </ListSubheader>
          }
        >
            <React.Fragment>

              {/* Sales Link */}
              <NavLink
                activeClassName="active-link"
                exact
                isActive={this.onPaths([ "/penjualan", "/detail-transaksi" ])}
                to="/penjualan"
                style={{ textDecoration: "none" }}
              >
                <ListItem button className="sidebar-item">
                  <ListItemIcon className="sidebar-icon"><ShoppingCartIcon /></ListItemIcon>
                  <ListItemText className="sidebar-item-text">Penjualan</ListItemText>
                </ListItem>
              </NavLink>

              {/* Printer Settings Link */}
              <NavLink
                activeClassName="active-link"
                exact
                isActive={this.onPaths([ "/pengaturan-printer", ])}
                to="/pengaturan-printer"
                style={{ textDecoration: "none" }}
              >
                <ListItem button className="sidebar-item">
                  <ListItemIcon className="sidebar-icon"><PrinterIcon /></ListItemIcon>
                  <ListItemText className="sidebar-item-text">Pengaturan Printer</ListItemText>
                </ListItem>
              </NavLink>

              <ListItem
                button
                className="sidebar-item"
                onClick={() => {
                  let resp = ipcRenderer.sendSync('open-sub-window');
                  if ( !resp ) {
                    this.setState({ openModal: true });
                  }
                }}
              >
                <ListItemIcon className="sidebar-icon"><LaunchIcon /></ListItemIcon>
                <ListItemText className="sidebar-item-text">Buka Tampilan Preview</ListItemText>
              </ListItem>
    
              {/* Logout Link */}
              <NavLink to="/" style={{ textDecoration: "none" }}>
                <ListItem
                  button
                  className="sidebar-item"
                  onClick={() => ipcRenderer.sendSync('clear-storage')}
                >
                  <ListItemIcon className="sidebar-icon"><ExitToAppIcon /></ListItemIcon>
                  <ListItemText className="sidebar-item-text">Logout</ListItemText>
                </ListItem>
              </NavLink>
    
            </React.Fragment>
        </List>
      </SwipeableDrawer>
      </>
    );

  }
}

export default withRouter(SwipeableDrawer_Com);