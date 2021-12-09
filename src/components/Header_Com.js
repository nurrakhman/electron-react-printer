import React, { useState } from "react";
import { AppBar, Toolbar, IconButton } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import ReplayIcon from '@material-ui/icons/Replay';
import CustomModal from "./Modal_Com";
import Sidebar from "./Sidebar_Com";
import "../styles/Header_Styles.css";

export default function HeaderCom(props) {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const toggleSidebar = (_, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
          return;
        }
        setIsSidebarOpen(open);
    }

    return (
        <>
            <Sidebar
                open={isSidebarOpen}
                onClose={toggleSidebar("left", false)}
                onOpen={toggleSidebar("left", true)}
            />
            <CustomModal
                open={openModal}
                modalType="reload-data"
                titleClassName="text-center"
                modalTitle="Apakah Anda yakin ingin memuat ulang data?"
                subtitle="*PERHATIAN: Data produk di keranjang belanja saat ini akan ter-reset."
                submitText="Submit"
                cancelText="Cancel"
                onClose={() => setOpenModal(false)}
                onClickCancel={() => setOpenModal(false)}
                refreshPage={() =>{
                    props.refreshPage();
                    setOpenModal(false);
                }}
            />
            <AppBar position="sticky" id="header-container">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        className="header-menu"
                        aria-label="menu"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <p className="header-title">
                        {props.title}
                    </p>
                    <IconButton
                        edge="end"
                        className="header-refresh"
                        aria-label="refresh"
                        onClick={() => setOpenModal(true)}
                    >
                        <ReplayIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
        </>
    )
}
