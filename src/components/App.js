import React from "react";
import { HashRouter, Route } from "react-router-dom";
import "../styles/Color_Styles.css";
import "../styles/Default_Styles.css";

// Pages
// import WinA from "./WinA";
import WinB from "./WinB";
import LoginPage from "../pages/Login_Page";
import SalesPage from "../pages/Sales_Page";
import TransactionDetailPage from "../pages/TransactionDetail_Page";
import PrinterSettingsPage from "../pages/PrinterSettings_Page";

function App() {
  return (
    <HashRouter>
      <div>
        {/* Main Windows */}
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/penjualan" component={SalesPage} />
        <Route exact path="/detail-transaksi" component={TransactionDetailPage} />
        <Route exact path="/pengaturan-printer" component={PrinterSettingsPage} />
        {/* Sub Windows */}
        <Route exact path="/tampilan" component={WinB} />
      </div>
    </HashRouter>
  );
}

export default App;
