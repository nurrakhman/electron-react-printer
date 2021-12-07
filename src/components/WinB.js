import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import "../styles/CustomerScreen_Styles.css";

const { ipcRenderer } = require('electron');

function WinB() {
  
  const [discount, setDiscount] = useState("Rp 0");
  const [tax, setTax] = useState("Rp 0");
  const [subtotal, setSubtotal] = useState("Rp 0");
  const [list, setList] = useState([]);

  useEffect( () => {
    ipcRenderer.on('update-data-label', (_, data) => {
      const overallData = JSON.parse(data);
      setDiscount(overallData[1].length > 0? overallData[0].discount : "Rp 0");
      setTax(overallData[0].tax);
      setSubtotal(overallData[0].total);
      setList(overallData[1]);
    });
  }, []);
  
  return (
    <Grid container id="sub-container">
      <Grid item xs={12} id="sub-header">
        <h1>Daftar Belanja</h1>
      </Grid>

      <Grid container id="customer-cart">
        <Grid item xs={1}>
          <h2 className="text-center">No</h2>
        </Grid>
        <Grid item xs={6}>
          <h2>Produk</h2>
        </Grid>
        <Grid item xs={1}>
          <h2 className="text-center">Kuantitas</h2>
        </Grid>
        <Grid item xs={2}>
          <h2 className="text-right">Harga Satuan</h2>
        </Grid>
        <Grid item xs={2}>
          <h2 className="text-right">Harga Total</h2>
        </Grid>

        {list.map((res, idx) => {
          return (
            <Grid container key={res._id}>
              <Grid item xs={1}>
                <p className="text-center">{idx+1}</p>
              </Grid>
              <Grid item xs={6}>
                <p>{res.product_code + " - " + res.name}</p>
              </Grid>
              <Grid item xs={1}>
                <p className="text-center">{res.quantity}</p>
              </Grid>
              <Grid item xs={2}>
                <p className="text-right">{res.selling_price}</p>
              </Grid>
              <Grid item xs={2}>
                <p className="text-right">{res.total_price}</p>
              </Grid>

              {res.discount !== "Rp 0"?
                <Grid container className="sub-discount">
                    <Grid item xs={1}></Grid>
                    <Grid item xs={9} sm={9}>
                        <p>Diskon</p>
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <p className="text-right">{res.discount}</p>
                    </Grid>
                </Grid> : <></>
            }
            {res.buyxgety?
                <Grid container className="sub-discount">
                    <Grid item xs={1}></Grid>
                    <Grid item xs={6}>
                        <p>{res.buyxgety.name}</p>
                    </Grid>
                    <Grid item xs={1}>
                        <p className="text-center">{res.buyxgety.qty}</p>
                    </Grid>
                    <Grid item xs={4}>
                        <p className="text-right">Rp 0</p>
                        {/* <p className="text-right">{res.buyxgety.price}</p> */}
                    </Grid>
                </Grid> : <></>
            }
            </Grid>
          )
        })}
      </Grid>

      {/* Footer */}
      <Grid container id="footer-cart">
        <Grid item xs={7}></Grid>
        <Grid item xs={2}>
          <h3 className="text-right">Diskon</h3>
        </Grid>
        <Grid item xs={3}>
          <h3 className="text-right">{discount}</h3>
        </Grid>

        <Grid item xs={7}></Grid>
        <Grid item xs={2}>
          <h3 className="text-right">Pajak</h3>
        </Grid>
        <Grid item xs={3}>
          <h3 className="text-right">{tax}</h3>
        </Grid>

        <Grid item xs={7}></Grid>
        <Grid item xs={2}>
          <h3 className="text-right">Subtotal</h3>
        </Grid>
        <Grid item xs={3}>
          <h3 className="text-right">{subtotal}</h3>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default WinB;
