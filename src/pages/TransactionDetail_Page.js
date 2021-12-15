import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import MuiAlert from '@material-ui/lab/Alert';
import NumberFormat from "react-number-format";
import { Autocomplete } from "@material-ui/lab";
import { Button, Grid, TextField, Snackbar, CircularProgress } from "@material-ui/core";
import HeaderCom from "../components/Header_Com";
import CustomModal from "../components/Modal_Com";
import { postTransaction } from "../logic/APIHandler";
import { formatPriceWithoutCurrency, formatToPrice, getDefaultAddress, unformatPrice } from "../logic/Handler";
import "../styles/TransactionDetail_Styles.css";
import logo from '../../assets/logo.png';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const path = require('path')
const { PosPrinter } = require("electron").remote.require(
    "electron-pos-printer"
);
const { ipcRenderer } = require("electron");
const { remote } = require("electron");

export default function TransactionDetail(props) {

    const history = useHistory();
    const digitRef = React.useRef();

    // Constant Data
    const money = [100000, 50000, 20000, 10000, 5000, 2000, 1000];

    // Transaction State
    const [itemList, setItemList] = useState([]);
    const [currDiscount, setCurrDiscount] = useState([]);
    const [currTax, setCurrTax] = useState(false);
    const [currCash, setCurrCash] = useState('Rp 0');
    const [currChange, setCurrChange] = useState('Rp 0');
    const [calculatedValue, setCalculatedValue] = useState('Rp 0');
    const [remainder, setRemainder] = useState('Rp 0');
    const [subtotalPure, setSubtotalPure] = useState('Rp 0');
    const [subtotal, setSubtotal] = useState('Rp 0');
    const [tempValue, setTempValue] = useState('');
    const [digit, setDigit] = useState('');

    // Dropdown State
    const [paymentCategories, setPaymentCategories] = useState([]);
    const [paymentOptions, setPaymentOptions] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState();
    const [bankOptions, setBankOptions] = useState([]);
    const [selectedBank, setSelectedBank] = useState();
    const [currMethod, setCurrMethod] = useState({
        label: 'Cash', category: 'cash', value: 'cash'
    });

    // Page State
    const [isTextLoading, setIsTextLoading] = useState(false);
    const [isJWTOpen, setIsJWTOpen] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [token, setToken] = useState('');
    const [connectedDevice, setConnectedDevice] = useState('');
    const [manualInput, setManualInput] = useState(false);
    const [finishText, setFinishText] = useState('KEMBALI');
    const [printData, setPrintData] = useState('');
    const [openSuccessAlert, setOpenSuccessAlert] = useState(false);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [alertText, setAlertText] = useState('');

    useEffect(() => {
        const params = props.location.state;
        if ( params ) {
            setToken(params.token);
            setItemList(params.itemList);
            setSubtotal(params.totalPrice);
            setRemainder(params.totalPrice);
            setCurrTax(params.currTax);
            setCurrMethod(params.currMethod);
            setCurrDiscount(params.currDiscount);
            setSubtotalPure(params.subtotalPure);
            setSelectedMethod(params.selectedMethod);
            setPaymentOptions(params.paymentOptions);
            setPaymentCategories(params.paymentCategories);
            if ( params.totalPrice !== 'Rp 0' ) {
                calculateCustomerCash(params.totalPrice);
            }
            else {
                setCalculatedValue('Rp 0');
            }
            setConnectedDevice(ipcRenderer.sendSync('get-printer'));
        }
    }, []);

    // Predict customer's cash
    const calculateCustomerCash = (data) => {
        let result = 0;
        let currSubtotal = unformatPrice(data);
        for ( let i = 0; i < money.length - 1; i++ ) {
            result += ((Math.floor(currSubtotal / money[i])) * money[i]);
            currSubtotal %= money[i];
            if ( currSubtotal >= money[i + 1] ) {
                if ( currSubtotal === money[i + 1] ) {
                    result += money[i + 1];
                }
                else {
                    result += money[i];
                }
                setCalculatedValue(formatToPrice(result));
                break;
            }
            else if ( currSubtotal === 0 ) {
                setCalculatedValue(formatToPrice(result));
                break;
            }
        }
    };

    const handlePaymentMethod = (payMethod) => {
        const method = paymentCategories.filter(
            res => res.value === payMethod.value
        )[0];
        setCurrMethod(method);
        setSelectedMethod(payMethod.value);
        setSelectedBank('');
        setTempValue('');
        setCurrChange('Rp 0');
        if ( method.value === 'cash' ) {
            setDigit('');
            setCurrCash('Rp 0');
            setRemainder(subtotal);
        }
        else if ( method.value.includes('it') ) {
            setDigit('');
            setCurrCash(subtotal);
            setManualInput(false);
            let bankOpts = paymentOptions.filter(
                res => res.category === payMethod.value
            );
            setBankOptions(bankOpts);
        }
    }

    const createDataForm = (type) => {
        let totalDiscount = 0;
        let allProducts = []; // Array berisi data produk untuk membuat transaksi penjualan
        itemList.forEach((res) => {
            // Jika allProducts sudah ada isi
            if ( allProducts.length > 0 ) {
                let isXDuplicate = false;
                let isYDuplicate = false;
                allProducts.forEach((prod) => {
                    // Jika produk x atau y sudah ada dalam allProducts
                    if ( prod.product_id === res._id
                        || (res.buyxgety && prod.product_id === res.buyxgety.id) ) {
                        // Jika produk x sudah ada, tambahkan kuantitas saja
                        if ( prod.product_id === res._id ) {
                            isXDuplicate = true;
                            prod.quantity += 1;
                        }
                        // Jika produk y sudah ada, tambahkan kuantitas saja
                        if ( res.buyxgety && prod.product_id === res.buyxgety.id ) {
                            isYDuplicate = true;
                            prod.quantity += 1;
                        }
                    }
                });

                // Jika produk x belum ada di allProducts maka tambahkan
                if ( !isXDuplicate ) {
                    if ( res.buyxgety && res._id === res.buyxgety.id ) {
                        isYDuplicate = true;
                    }
                    if ( type === 'print' && isYDuplicate ) {
                        allProducts.push({
                            'quantity': res.quantity,
                            'selling_price': unformatPrice(res.selling_price),
                            'total_price': unformatPrice(res.total_price),
                            'name': res.name,
                            'discount': res.discount,
                        });
                        allProducts.push({
                            'quantity': res.buyxgety.qty,
                            'selling_price': 0,
                            'total_price': 0,
                            'name': res.name,
                            'discount': false,
                        });
                    }
                    else {
                        let object = {
                            'quantity': (res.buyxgety && res._id === res.buyxgety.id) ?
                                (res.quantity + res.buyxgety.qty) : res.quantity,
                            'selling_price': unformatPrice(res.selling_price),
                            'total_price': unformatPrice(res.total_price),
                        };
                        if ( type === 'print' ) {
                            object.name = res.name;
                            object.discount = res.discount;
                            allProducts.push(object);
                        }
                        else {
                            object.product_id = res._id;
                            allProducts.push(object);
                        }
                    }
                }
                // Jika ada buyxgety dan produk y belum ada di allProducts maka tambahkan
                if ( res.buyxgety && !isYDuplicate ) {
                    let object = {
                        'quantity': res.buyxgety.qty,
                        'selling_price': 0,
                        'total_price': 0,
                    };
                    if ( type === 'print' ) {
                        object.name = res.buyxgety.name;
                        object.discount = false;
                        allProducts.push(object);
                    }
                    else {
                        object.product_id = res.buyxgety.id;
                        allProducts.push(object);
                    }
                }
            }
            // Jika allProducts masih kosong
            else {
                let product = {
                    'quantity': res.quantity,
                    'selling_price': unformatPrice(res.selling_price),
                    'total_price': unformatPrice(res.total_price),
                };
                if ( type === 'print' ) {
                    product.name = res.name;
                    product.discount = res.discount;
                }
                else { product.product_id = res._id; }

                let updatedProduct = false;
                if ( res.buyxgety ) {
                    if ( type === 'print' ) {
                        allProducts.push(product);
                        updatedProduct = {
                            'quantity': res.buyxgety.qty,
                            'selling_price': 0,
                            'total_price': 0,
                            'name': res.buyxgety.name,
                            'discount': false,
                        };
                    }
                    else {
                        // Jika produk y sama dengan x
                        if ( product.product_id === res.buyxgety.id ) {
                            updatedProduct = {...product, quantity: product.quantity + 1};
                        }
                        // Jika produk y tidak sama dengan x
                        else {
                            let object = {
                                'quantity': res.buyxgety.qty,
                                'selling_price': 0,
                                'total_price': 0,
                                'product_id': res.buyxgety.id,
                            };
                            allProducts.push(object);
                        }
                    }
                }
                if ( updatedProduct ) {
                    allProducts.push(updatedProduct);
                }
                else {
                    allProducts.push(product);
                }
            }

            // Jika produk mengandung diskon
            if ( res.promo_id ) {
                if ( res.promo_id.type_promo === 'persen' ) {
                    totalDiscount += Math.ceil(unformatPrice(res.total_price) * res.promo_id.value / 100);
                }
                else if ( res.promo_id.type_promo === 'rupiah' ) {
                    totalDiscount += res.promo_id.value * res.quantity;
                }
                else if ( res.promo_id.type_promo === 'buyxgety' ) {
                    totalDiscount += unformatPrice(res.buyxgety.price);
                }
            }
        });

        // Jika memakai diskon apply to all, tambahkan ke overallDiscount
        let overallDiscount = parseInt(totalDiscount);
        if ( currDiscount.type === 'rupiah' ) {
            overallDiscount += unformatPrice(currDiscount.discount);
        }
        else if ( currDiscount.type === 'persen' ) {
            overallDiscount += Math.ceil(unformatPrice(currDiscount.discount)
                * unformatPrice(subtotalPure) / 100);
        }

        const data = {
            'total_price': unformatPrice(subtotal),
            'total_discount': overallDiscount,
            'items': allProducts,
            'type_payment': {
                'payment_id': currMethod.category === 'cash' ?
                    paymentOptions.filter(res => res.category === 'cash')[0].value : selectedBank.value,
                'notes': currMethod.label.includes('it') ?
                    digit : currCash,
            },
            'taxes': [{
                'name': currTax.name,
                'value': currTax.value,
                'total':
                    currDiscount.type === 'rupiah' ?
                        Math.ceil((unformatPrice(subtotalPure) - unformatPrice(currDiscount.discount))
                            * currTax.value / 100)
                    : currDiscount.type === 'persen' ?
                        Math.ceil((unformatPrice(subtotalPure) * (100
                            - unformatPrice(currDiscount.discount)) / 100) * currTax.value / 100)
                    : Math.ceil(unformatPrice(subtotalPure) * currTax.value / 100),
            }],
        };

        return data;
    };

    const handlePrintReceipt = (receipt) => {
        const data = createDataForm('print');
        const mainLogo = ipcRenderer.sendSync('get-logo');

        // Create table body value
        let tableData = [];
        for ( let i = 0; i < data.items.length; i++) {
            const res = data.items[i];
            tableData.push({
                type: "text",
                value: res.name,
                style: `text-align: left; width: 210px; margin-left: -5px`,
                css: { "font-size": "11px", "font-family": "Arial" }
            });
            tableData.push({
                type: 'table',
                style: 'border-style: none; margin-left: -7px',
                tableBody: [[
                    {
                        type: 'text',
                        value: res.quantity.toString(),
                        style: `text-align: left; width: 25px; font-family: Arial;`,
                    },
                    {
                        type: 'text',
                        value: 'X',
                        style: `text-align: left; width: 5px; font-family: Arial;`,
                    },
                    {
                        type: 'text',
                        value: formatPriceWithoutCurrency(res.selling_price),
                        style: `text-align: right; width: 90px; font-family: Arial;`,
                    },
                    {
                        type: 'text',
                        value: formatPriceWithoutCurrency(res.total_price),
                        style: `text-align: right; width: 90px; font-family: Arial;`,
                    },
                ]],
                tableBodyStyle: 'border-style: none',
            });
            if ( res.discount && res.discount !== 'Rp 0' ) {
                tableData.push({
                    type: 'table',
                    style: 'border-style: none; margin-top: -3px; margin-left: -7px',
                    tableBody: [[
                        {
                            type: 'text',
                            value: 'Diskon',
                            style: `text-align: left; width: 105px; font-family: Arial;`,
                        },
                        {
                            type: 'text',
                            value: ('-' + res.discount.replace('Rp ', '')),
                            style: `text-align: right; width: 105px; font-family: Arial;`,
                        },
                    ]],
                    tableBodyStyle: 'border-style: none',
                });
            }
            if ( i === (data.items.length - 1) ) {
                // PRINT DISKON APPLY TO ALL
                if ( currDiscount.type !== 'null' ) {
                    let labelDiscount = '';
                    let printDiscount = '0';
                    if ( currDiscount.type === 'rupiah' ) {
                        labelDiscount = currDiscount.label;
                        printDiscount = currDiscount.discount.replace('Rp ', '');
                    }
                    else if ( currDiscount.type === 'persen' ) {
                        labelDiscount = currDiscount.label + ' (' + currDiscount.discount + ')';
                        printDiscount = formatPriceWithoutCurrency(Math.ceil(
                            unformatPrice(currDiscount.discount) * unformatPrice(subtotalPure) / 100
                        ));
                    }
                    tableData.push({
                        type: 'table',
                        style: 'border-style: none; margin-left: -7px',
                        tableBody: [[
                            {
                                type: 'text',
                                value: labelDiscount,
                                style: `text-align: left; width: 120px; font-family: Arial;`,
                            },
                            {
                                type: 'text',
                                value: ('-' + printDiscount),
                                style: `text-align: right; width: 90px; font-family: Arial;`,
                            },
                        ]],
                        tableBodyStyle: 'border-style: none',
                    });
                }
                if ( data.taxes[0].value > 0 ) {
                    tableData.push({
                        type: 'table',
                        style: 'border-style: none; margin-left: -7px',
                        tableBody: [[
                            {
                                type: 'text',
                                value: (data.taxes[0].name + ' (' + data.taxes[0].value + '%)'),
                                style: `text-align: left; width: 105px; font-family: Arial;`,
                            },
                            {
                                type: 'text',
                                value: formatPriceWithoutCurrency(data.taxes[0].total),
                                style: `text-align: right; width: 105px; font-family: Arial;`,
                            },
                        ]],
                        tableBodyStyle: 'border-style: none',
                    });
                }

                tableData.push({
                    type: "text",
                    value: "_____________________________________",
                    style: `text-align: center; margin-top: -10px; margin-left: -5px;`,
                    css: { "font-size": "12px", "font-family": "Arial" }
                });

                tableData.push({
                    type: 'table',
                    style: `border-style: none; margin-left: -7px;`,
                    tableBody: [[
                        {
                            type: 'text',
                            value: 'Total',
                            style: `text-align: left; width: 105px; font-family: Arial;`,
                        },
                        {
                            type: 'text',
                            value: formatPriceWithoutCurrency(data.total_price),
                            style: `text-align: right; width: 105px; font-family: Arial;`,
                        },
                    ]],
                    tableBodyStyle: 'border-style: none',
                });

                if ( currMethod.category === 'cash' ) {
                    tableData.push({
                        type: 'table',
                        style: `border-style: none; margin-left: -7px;`,
                        tableBody: [[
                            {
                                type: 'text',
                                value: 'Charges (Cash)',
                                style: `text-align: left; width: 105px; font-family: Arial;`,
                            },
                            {
                                type: 'text',
                                value: currCash.replace('Rp ', ''),
                                style: `text-align: right; width: 105px; font-family: Arial;`,
                            },
                        ]],
                        tableBodyStyle: 'border-style: none',
                    });
                    tableData.push({
                        type: 'table',
                        style: 'border-style: none; margin-left: -7px; margin-bottom: 20px',
                        tableBody: [[
                            {
                                type: 'text',
                                value: 'Changes',
                                style: `text-align: left; width: 105px; font-family: Arial;`,
                            },
                            {
                                type: 'text',
                                value: currChange.replace('Rp ', ''),
                                style: `text-align: right; width: 105px; font-family: Arial;`,
                            },
                        ]],
                        tableBodyStyle: 'border-style: none',
                    });
                }
            }
        }

        // Create printing data
        let address = ipcRenderer.sendSync('get-address');
        if ( address ) {
            address = JSON.parse(address);
        }
        else {
            address = getDefaultAddress();
        }
        let printData = [
            {
                type: 'image',
                path: mainLogo.path,
                position: 'center',
                width: '160px',
                height: '40px',
            },
            {
                type: "text",
                value: address[0],
                style: `text-align: center;`,
                css: { "font-size": "10px", "font-family": "Arial" }
            },
            {
                type: "text",
                value: address[1],
                style: `text-align: center;`,
                css: { "font-size": "10px", "font-family": "Arial" }
            },
            {
                type: "text",
                value: address[2],
                style: `text-align: center;`,
                css: { "font-size": "10px", "font-family": "Arial" }
            },
            {
                type: "text",
                value: receipt,
                style: `text-align: center; margin-top: 15px;`,
                css: { "font-size": "11px", "font-family": "Arial" }
            },
            {
                type: "text",
                value: "_____________________________________",
                style: `text-align: center; margin-bottom: 10px; margin-left: -5px`,
                css: { "font-size": "12px", "font-family": "Arial" }
            },
        ];

        tableData.forEach(res => {
            printData.push(res);
        })

        setPrintData(printData);
        printReceipt(printData);
    };

    const printReceipt = (data) => {
        let options = [];
        const activePrinter = ipcRenderer.sendSync('get-printer');
        options = {
            preview: false, // Preview in window or print
            width: "210px", //  width of content body
            margin: "0 0 0 0", // margin of content body
            copies: 1, // Number of copies to print
            printerName: activePrinter, // printerName: string, check it at webContent.getPrinters()
            timeOutPerLine: 5000,
            silent: true
        };

        if ( activePrinter ) {
            const dataToPrint = printData? printData : data;
            PosPrinter.print(dataToPrint, options)
              .then(() => {})
              .catch(error => {
                console.log(error);
            });
        }
    }

    // Submit and create new transaction
    const onSubmitTransaction = async () => {
        // printerTest();
        if ( (digit.length >= 4 && digit !== 'xxxx') || (currMethod.category === 'cash'
            && currCash && unformatPrice(currCash) >= unformatPrice(subtotal)) )
        {
            if ( itemList.length > 0 ) {
                setIsTextLoading(true);
                const data = createDataForm('pay');
                let resp = await postTransaction(data, token);
                if ( resp[0] && resp[0].status === 200 ) {
                    setIsPaid(true);
                    setFinishText('SELESAI');
                    setAlertText('Berhasil membuat transaksi!');
                    setOpenSuccessAlert(true);
                    handlePrintReceipt(resp[0].data.no_invoice);
                }
                else if ( resp[1] && resp[1].status === 401 ) {
                    setIsJWTOpen(true);
                }
                else {
                    setAlertText('Gagal membuat transaksi!');
                    setOpenErrorAlert(true);
                }
                setIsTextLoading(false);
            }
            else {
                setAlertText('Belum ada barang dalam keranjang belanja');
                setOpenErrorAlert(true);
            }
        }
        else if ( currMethod.value === 'debit' || currMethod.value === 'credit-card' ) {
            if ( selectedBank ) {
                setAlertText('Pengisian 4 digit terakhir nomor kartu belum benar');
                setOpenErrorAlert(true);
            }
            else {
                setAlertText('Pilih jenis bank terlebih dulu');
                setOpenErrorAlert(true);
            }
        }
        else if ( currMethod.category === 'cash' && !currCash ) {
            setAlertText('Mohon isi uang cash kustomer');
            setOpenErrorAlert(true);
        }
        else if ( currMethod.category === 'cash'
            && unformatPrice(currCash) < unformatPrice(subtotal) ) {
            setAlertText('Uang kustomer kurang dari harga total!');
            setOpenErrorAlert(true);
        }
    };

    const handleNavigation = async () => {
        if ( isPaid ) {
            ipcRenderer.send('update-data-tampilan', 'reset');
            history.push({
                pathname: "/penjualan",
                state: { isRefresh: true },
            });
        }
        else {
            history.replace({
                pathname: "/penjualan",
                state: {
                    itemList: itemList,
                    subtotalPure: subtotalPure,
                    totalPrice: subtotal,
                    token: token,
                    currTax: currTax,
                    currMethod: currMethod,
                    currDiscount: currDiscount,
                    paymentOptions: paymentOptions,
                    paymentCategories: paymentCategories,
                    selectedMethod: selectedMethod,
                }
            });
        }
    }

    return (
        <Grid container className="main-container">
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
            <CustomModal
                open={isJWTOpen}
                modalType="handle-jwt"
                titleClassName="text-center"
                modalTitle="Token Anda Sudah Expire"
            />
            <Grid item xs={12}>
                <HeaderCom title="Detail Transaksi" />
                <Grid container className="main-content">
                    <Grid item xs={5} className="left-content">
                        <Grid container spacing={2}>
                            <Grid item xs={12} id="payment-type-section">
                                <Autocomplete
                                    disableClearable
                                    className="dropdown-payment-type"
                                    options={paymentCategories}
                                    defaultValue={{ label: 'Cash', category: 'cash', value: 'cash' }}
                                    onChange={(_, value) => {
                                        handlePaymentMethod(value);
                                    }}
                                    getOptionLabel={(option) => option.label}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            label="Metode Pembayaran"
                                            placeholder="Pilih Tipe Pembayaran"
                                            variant="outlined"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    }
                                />
                            </Grid>
                            {currMethod && currMethod.category.includes('it') ?
                                <>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            disableClearable
                                            className="dropdown-bank"
                                            options={bankOptions}
                                            defaultValue={selectedBank}
                                            onChange={(_, value) => {
                                                setSelectedBank(value);
                                                digitRef.current.focus();
                                            }}
                                            getOptionLabel={(option) => option.label}
                                            renderInput={(params) =>
                                                <TextField
                                                    {...params}
                                                    autoFocus
                                                    label="Pilih Bank *"
                                                    placeholder="Pilih Bank"
                                                    variant="outlined"
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                />
                                            }
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            variant="outlined"
                                            label="4 Digit Terakhir"
                                            className="full-width"
                                            placeholder="xxxx"
                                            value={digit}
                                            onChange={(e) => {
                                                if ( e.target.value.length <= 4 ) {
                                                    setDigit(e.target.value);
                                                }
                                            }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            inputRef={digitRef}
                                        />
                                    </Grid>
                                </>
                                :
                                <>
                                    <Grid item xs={12} style={{ position: "relative" }}>
                                        <label className="price-label">
                                            Input Cash
                                        </label>
                                        <NumberFormat
                                            autoFocus
                                            variant="outlined"
                                            customInput={TextField}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix={"Rp "}
                                            value={manualInput}
                                            onChange={(e) => {
                                                setManualInput(unformatPrice(e.target.value));
                                                setCurrCash(e.target.value);
                                                setCurrChange(formatToPrice(unformatPrice(e.target.value)
                                                    - unformatPrice(subtotal)));
                                                const remainderVal = unformatPrice(subtotal)
                                                    - unformatPrice(e.target.value);
                                                if ( remainderVal >= 0 ) {
                                                    setRemainder(formatToPrice(remainderVal));
                                                }
                                                else {
                                                    setRemainder("Rp 0");
                                                }
                                            }}
                                            className="full-width thin-textfield"
                                            placeholder="Rp 0"
                                            allowNegative={false}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            className="primary-btn full-btn thick-btn"
                                            onClick={() => {
                                                setRemainder('Rp 0');
                                                setCurrCash(subtotal);
                                                setCurrChange('Rp 0');
                                                setManualInput(subtotal);
                                            }}
                                        >
                                            UANG PAS
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            variant="contained"
                                            className="primary-btn full-btn thick-btn"
                                            onClick={() => {
                                                setCurrCash(calculatedValue);
                                                setCurrChange(formatToPrice(unformatPrice(calculatedValue)
                                                    - unformatPrice(subtotal)));
                                                setRemainder('Rp 0');
                                                setManualInput(calculatedValue);
                                            }}
                                        >
                                            {calculatedValue}
                                        </Button>
                                    </Grid>
                                </>
                            }
                        </Grid>
                    </Grid>
                    <Grid item xs={7} className="right-content">
                        <Grid container>
                            <Grid item xs={12}>
                                <h3 style={{ marginTop: 0 }}>Detail Transaksi</h3>
                            </Grid>
                            <Grid item xs={6}>
                                <p>Subtotal</p>
                            </Grid>
                            <Grid item xs={6}>
                                <p className="text-right">{subtotalPure}</p>
                            </Grid>
                            <Grid item xs={6}>
                                <p>
                                    {`Diskon (${currDiscount.type !== 'null' ?
                                        currDiscount.discount : '0%'
                                    })`}
                                </p>
                            </Grid>
                            <Grid item xs={6}>
                                <p className="text-right">
                                    {`- ${
                                        currDiscount.type === 'rupiah' ?
                                            currDiscount.discount
                                        : currDiscount.type === 'persen' ?
                                            formatToPrice(Math.ceil(unformatPrice(currDiscount.discount)
                                                * unformatPrice(subtotalPure) / 100))
                                        : 'Rp 0'
                                    }`}
                                </p>
                            </Grid>
                            <Grid item xs={6}>
                                <p>Pajak</p>
                            </Grid>
                            <Grid item xs={6}>
                                <p className="text-right">
                                    {currDiscount.type === 'rupiah' ?
                                        formatToPrice(Math.ceil((unformatPrice(subtotalPure)
                                            - unformatPrice(currDiscount.discount)) * currTax.value / 100)
                                        )
                                    : currDiscount.type === 'persen' ?
                                        formatToPrice(
                                            Math.ceil((unformatPrice(subtotalPure)
                                                * (100 - unformatPrice(currDiscount.discount))
                                                / 100) * currTax.value / 100)
                                        )
                                    : formatToPrice(Math.ceil(
                                        unformatPrice(subtotalPure) * currTax.value / 100
                                      ))
                                    }
                                </p>
                            </Grid>
                        </Grid>
                        <Grid container id="transaction-final-result">
                            <Grid item xs={6}>
                                <h4>Total</h4>
                            </Grid>
                            <Grid item xs={6}>
                                <h4 className="text-right">{subtotal}</h4>
                            </Grid>
                            <Grid item xs={6}>
                                <p>Uang Kustomer</p>
                            </Grid>
                            <Grid item xs={6}>
                                <p className="text-right">{currCash}</p>
                            </Grid>
                            <Grid item xs={6}>
                                <p>Uang Kembalian</p>
                            </Grid>
                            <Grid item xs={6}>
                                <p className="text-right">{currChange}</p>
                            </Grid>
                            { currMethod && currMethod.category.toLowerCase().includes('it') ?
                                <>
                                    <Grid item xs={6}>
                                        <p>
                                            {`4 Digit Terakhir ${selectedBank?
                                                ("(" + selectedBank.label + ")") : "( - )"}`}
                                        </p>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <p className="text-right">{digit? digit : "xxxx"}</p>
                                    </Grid>
                                </>
                                : <></>
                            }
                            { currMethod && currMethod.category === 'cash' ?
                                <>
                                    <Grid item xs={6}>
                                        <p>Sisa Tagihan</p>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <p className="text-right">{remainder}</p>
                                    </Grid>
                                </>
                                : <></>
                            }
                        </Grid>
                        <Grid container className="fixed-footer">
                            <Grid item xs={12} className="margin-bottom">
                                <Button
                                    variant="contained"
                                    className="primary-btn full-btn thick-btn"
                                    onClick={onSubmitTransaction}
                                    disabled={isPaid? true : false}
                                >
                                    {isTextLoading?
                                        <CircularProgress color="inherit" size={25} />
                                        : "BAYAR"
                                    }
                                </Button>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Button
                                        variant="outlined"
                                        className="secondary-btn full-btn thick-btn"
                                        onClick={printReceipt}
                                        disabled={!isPaid?
                                            true : false
                                        }
                                    >
                                        {`PRINT BON (${connectedDevice ?
                                            connectedDevice : 'no device connected'})
                                        `}
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button
                                        variant="outlined"
                                        className={`
                                            ${isPaid? "primary-btn" : "secondary-btn"}
                                            full-btn thick-btn
                                        `}
                                        onClick={handleNavigation}
                                    >
                                        {finishText}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
