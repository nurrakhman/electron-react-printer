import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { formatToPrice, unformatPrice } from "../logic/Handler";
import "../styles/CustomerScreen_Styles.css";

const { ipcRenderer } = require('electron');

function WinB() {
  
  const [showThanks, setShowThanks] = useState(false);
  const [discount, setDiscount] = useState({
    name: null,
    value: null,
    total: "Rp 0",
  });
  const [tax, setTax] = useState({
    name: null,
    value: null,
    total: "Rp 0",
  });
  const [subtotal, setSubtotal] = useState("Rp 0");
  const [list, setList] = useState([]);

  useEffect( () => {
    ipcRenderer.on('update-data-label', (_, data) => {
      if ( data !== "reset" ) {
        const overallData = JSON.parse(data);
        calculateData(overallData);
        setSubtotal(overallData[0].total);
        setList(overallData[1]);
      }
      else {
        resetData();
      }
    });
  }, []);

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  };

  const calculateData = (data) => {
    const products = data[1];
    let totalProductPrice = 0;
    let totalProductDiscount = 0;
    let totalTax = 0, totalDiscount = 0;
    products.forEach(res => {
      totalProductPrice += unformatPrice(res.total_price);
      totalProductDiscount += unformatPrice(res.discount);
    });
    if ( data[0].discount.type === "persen" ) {
      let percenDisc = unformatPrice(data[0].discount.discount);
      totalDiscount = totalProductDiscount + Math.ceil(
        (totalProductPrice - totalProductDiscount) * percenDisc / 100
      );
      percenDisc = Math.ceil(
        (totalProductPrice - totalProductDiscount) * (100 - percenDisc) / 100
      );
      totalTax = Math.ceil(percenDisc * data[0].tax.value / 100);
    }
    else if ( data[0].discount.type === "rupiah" ) {
      const flatDisc = unformatPrice(data[0].discount.discount);
      totalTax = Math.ceil(
        (totalProductPrice - totalProductDiscount - flatDisc) * data[0].tax.value / 100
      );
      totalDiscount = totalProductDiscount + flatDisc;
    }
    else {
      totalTax = Math.ceil(
        (totalProductPrice - totalProductDiscount) * data[0].tax.value / 100
      );
      totalDiscount = totalProductDiscount;
    }
    setTax({
      name: data[0].tax.name,
      value: data[0].tax.value,
      total: formatToPrice(totalTax),
    });
    setDiscount({
      name: data[0].discount.value? data[0].discount.label : null,
      value: data[0].discount.discount,
      total: formatToPrice(totalDiscount),
    });
  }

  const resetData = async () => {
    setShowThanks(true);
    setList([]);
    setSubtotal("Rp 0");
    setTax({ name: null, value: null, total: "Rp 0" });
    setDiscount({ name: null, value: null, total: "Rp 0" });
    await sleep(2500);
    setShowThanks(false);
  }
  
  return ( showThanks ?
    <Grid container id="sub-container-thanks">
      <h1>Terima Kasih Sudah Berbelanja Di Tempat Kami!</h1>
    </Grid>
    : <Grid container id="sub-container">
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

        <div id="preview-items">
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
        </div>
      </Grid>

      {/* Footer */}
      <Grid container id="footer-cart">
        <Grid item xs={9}>
          <h3 className="text-right">
            {discount.name?
              `Diskon ${discount.name} (${discount.value})` : "Diskon"
            }
          </h3>
        </Grid>
        <Grid item xs={3}>
          <h3 className="text-right">{discount.total}</h3>
        </Grid>

        <Grid item xs={9}>
          <h3 className="text-right">
            {tax.name?
              `Pajak ${tax.name} (${tax.value}%)` : "Pajak"
            }
          </h3>
        </Grid>
        <Grid item xs={3}>
          <h3 className="text-right">{tax.total}</h3>
        </Grid>

        <Grid item xs={9}>
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
