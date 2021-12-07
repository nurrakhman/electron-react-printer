import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import MuiAlert from '@material-ui/lab/Alert';
import { Autocomplete } from "@material-ui/lab";
import { Grid, Button, TextField, Snackbar } from "@material-ui/core";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { getSalesData } from "../logic/APIHandler";
import { formatToPrice, unformatPrice } from "../logic/Handler";
import CustomModal from "../components/Modal_Com";
import HeaderCom from "../components/Header_Com";
import Spinner from "../components/Loading_Com";
import "../styles/Sales_Styles.css";

const { ipcRenderer } = window.require('electron')

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function SalesPage() {

    const history = useHistory();
    const autoRef = useRef();

    // Data State
    const [taxValue, setTaxValue] = useState(0);
    const [currTax, setCurrTax] = useState(false);
    const [subtotalPure, setSubtotalPure] = useState(0);
    const [subtotal, setSubtotal] = useState('Rp 0');
    const [itemList, setItemList] = useState([]);
    const [products, setProducts] = useState([]);
    const [autocompleteKey, setAutocompleteKey] = useState('');

    // Picker State
    const [paymentOptions, setPaymentOptions] = useState('');
    const [paymentCategs, setPaymentCategs] = useState('');
    const [currMethod, setCurrMethod] = useState();
    const [selectedMethod, setSelectedMethod] = useState();
    const [discountOptions, setDiscountOptions] = useState('');
    const [currDiscount, setCurrDiscount] = useState(
        { id: 'no-discount', label: 'Tidak pakai', value: false, discount: '0%', type: 'null' }
    );
    const [selectedDiscount, setSelectedDiscount] = useState(
        { id: 'no-discount', label: 'Tidak pakai', value: false, discount: '0%', type: 'null' }
    );

    // Page State
    const [isLoading, setIsLoading] = useState(true);
    const [isJWTOpen, setIsJWTOpen] = useState(false);
    const [openErrorAlert, setOpenErrorAlert] = useState(false);
    const [alertText, setAlertText] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // Come from Detail Transaction page
        const params = history.location.state;
        if ( params ) {
            // If previous transaction has been paid
            if ( !params.isRefresh ) {
                applySavedData(params);
            }
            getData(params.token);
        }
        // Come from page other than Detail Transaction
        else {
            const token = ipcRenderer.sendSync('get-token');
            setToken(token);
            getData(token);
        }
    },[]);

    // Get list of products
    const getData = async (currToken) => {
        setIsLoading(true);
        const dataInStorage = ipcRenderer.sendSync('get-data');
        let resp = '';
        let storageData = '';
        // If storage already stored data
        if ( dataInStorage ) {
            storageData = JSON.parse(dataInStorage);
            resp = [{ status: 200 }];
        }
        // If storage hasn't store data
        else {
            resp = await getSalesData(currToken);
        }
        if ( resp[0] && resp[0].status === 200 ) {
            if ( !dataInStorage ) {
                ipcRenderer.sendSync('store-data', JSON.stringify(resp[0].data));
            }
            // Handle products
            let tempProducts = dataInStorage ? storageData.products : resp[0].data.products;
            tempProducts.forEach(res => {
                res.id = res._id;
                res.title = res.product_code + " - " + res.name;
                res.discount = 'Rp 0';
                res.quantity = 1;
                res.total_price = formatToPrice(res.selling_price);
                res.selling_price = formatToPrice(res.selling_price);
                res.buyxgety = false;
            });
            setProducts(tempProducts);

            // Handle Payment Methods
            let pmOpts = [];
            let hasDebit = false, hasCredit = false;
            let payCategs = [{ label: 'Cash', category: 'cash', value: 'cash' }];
            let tempPayments = dataInStorage ? storageData.payments_type : resp[0].data.payments_type;
            tempPayments.forEach(res => {
                if ( !hasDebit && res.category === 'debit' ) {
                    hasDebit = true;
                    payCategs.push({
                        label: 'Debit', category: 'debit', value: 'debit',
                    });
                }
                else if ( !hasCredit && res.category === 'credit-card' ) {
                    hasCredit = true;
                    payCategs.push({
                        label: 'Kredit', category: 'credit-card', value: 'credit-card',
                    });
                }
                pmOpts.push({
                    'label': res.name,
                    'category': res.category,
                    'value': res._id,
                });
            });
            setCurrMethod(pmOpts[0]);
            setSelectedMethod(pmOpts[0]);
            setPaymentOptions(pmOpts);
            setPaymentCategs(payCategs);

            // Handle Discounts
            let discountOpts = [
                { id: 'no-discount', label: 'Tidak pakai', value: false, discount: '0%', type: 'null' },
            ];
            let tempDiscounts = dataInStorage ? storageData.discounts : resp[0].data.discounts;
            tempDiscounts.forEach(res => {
                if ( res.type_promo !== 'buyxgety' ) {
                    discountOpts.push({
                        'label': res.name,
                        'value': res._id,
                        'type': res.type_promo,
                        'discount': res.type_promo === 'persen' ?
                            (res.value + '%') : formatToPrice(res.value),
                    });
                }
            });
            setDiscountOptions(discountOpts);

            // Handle Taxes
            setCurrTax(dataInStorage ? storageData.taxes[0] : resp[0].data.taxes[0]);
            setTaxValue(dataInStorage ? storageData.taxes[0].value : resp[0].data.taxes[0].value);

            setIsLoading(false);
        }
        else if ( resp[1] && resp[1].status === 401 ) {
            setIsJWTOpen(true);
            setIsLoading(false);
        }
        else {
            // Otomatis panggil kembali API jika gagal memuat data
            setAlertText('Gagal memuat data, mencoba memuat data kembali...');
            setOpenErrorAlert(true);
            getData(currToken);
        }
    };

    const applySavedData = (savedData) => {
        setIsLoading(true);
        setToken(savedData.token);
        setItemList(savedData.itemList);
        setSubtotalPure(unformatPrice(savedData.subtotalPure));
        setSubtotal(savedData.totalPrice);
        setCurrTax(savedData.currTax);
        setCurrMethod(savedData.currMethod);
        setCurrDiscount(savedData.currDiscount);
        setPaymentOptions(savedData.paymentOptions);
        setPaymentCategs(savedData.paymentCategories);
        setSelectedMethod(savedData.selectedMethod);
        setIsLoading(false);
    }

    // Add product to list of item
    const handleAddProduct = async (search) => {
        const element = autoRef.current.getElementsByClassName('MuiAutocomplete-clearIndicator')[0];
        if ( element ) element.click();
        if ( search ) {
            // Get product code only
            let code = "";
            for ( let i=0; i < search.length; i++ ) {
                if ( search[i] !== " " ) {
                    code += search[i];
                }
                else {
                    break;
                }
            }
            let result = itemList;
            const isDuplicate = itemList.filter(res =>
                res.product_code.toLowerCase() === code.toLowerCase()
            );
            // Jika produk sudah ada di cart
            if ( isDuplicate.length > 0 ) {
                result.forEach(res => {
                    // Update hanya atribut produk yang dipilih
                    if ( res.product_code === isDuplicate[0].product_code ) {
                        // Update kuantitas
                        res.quantity += 1;
                        setAutocompleteKey(res._id + " " + res.quantity);
                        // Update current price di cart
                        res.total_price = unformatPrice(res.total_price) + unformatPrice(res.selling_price);
                        res.total_price = formatToPrice(res.total_price);

                        // Cek diskon per produk
                        let localDisc = 0, lastDisc = 0;
                        if ( res.promo_id && res.promo_id.type_promo === 'buyxgety' ) {
                            if ( res.promo_id.x.value === res.quantity ) {
                                let isInCart = false;
                                itemList.forEach(prod => {
                                    if ( prod._id === res.promo_id.y.product_id._id ) {
                                        isInCart = true;
                                        setAlertText('Tidak mendapat produk gratisan karena produk gratisan'
                                            + ' sudah ada dalam keranjang belanja');
                                        setOpenErrorAlert(true);
                                    }
                                });
                                if ( !isInCart ) {
                                    res.buyxgety = {
                                        id: res.promo_id.y.product_id._id,
                                        name: res.promo_id.y.product_id.name,
                                        qty: parseInt(res.promo_id.y.value),
                                        price: formatToPrice(res.promo_id.y.value
                                            * res.promo_id.y.product_id.selling_price),
                                    };
                                }
                            }
                        }
                        else if ( res.promo_id && res.promo_id.type_promo === 'persen' ) {
                            localDisc = Math.ceil(unformatPrice(res.total_price)
                                * res.promo_id.value / 100);
                            lastDisc = unformatPrice(res.discount);
                            res.discount = formatToPrice(localDisc);
                        }
                        else if ( res.promo_id && res.promo_id.type_promo === 'rupiah' ) {
                            localDisc = unformatPrice(res.promo_id.value) * res.quantity;
                            lastDisc = unformatPrice(res.discount);
                            res.discount = formatToPrice(localDisc);
                        }

                        // Cek jika sedang memakai diskon persenan
                        let total = subtotalPure + lastDisc - localDisc + unformatPrice(res.selling_price);
                        setSubtotalPure(total);
                        if ( currDiscount.type === 'persen' ) {
                            const currDisc = Math.ceil(total
                                * unformatPrice(currDiscount.discount) / 100);
                            let tax = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
                            setSubtotal(formatToPrice(tax));
                        }
                        else if ( currDiscount.type === 'rupiah' ) {
                            const currDisc = unformatPrice(currDiscount.discount);
                            let tax = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
                            setSubtotal(formatToPrice(tax));
                        }
                        else {
                            let tax = Math.ceil(total * (100 + taxValue) / 100);
                            setSubtotal(formatToPrice(tax));
                        }
                    }
                });
                setItemList(result);
            }
            // Jika produk belum ada di cart
            else {
                // Cek jika kode produk yang dimasukkan ada dalam DB
                const product = products.filter(res =>
                    res.product_code.toLowerCase() === code.toLowerCase()
                )[0];
                let isInCart = false;
                itemList.forEach(res => {
                    // Cek jika produk berdiskon buy x get y
                    if ( product && product.promo_id && product.promo_id.type_promo === 'buyxgety' ) {
                        // Cek jika produk sudah jadi produk gratisan dalam cart
                        if ( res.buyxgety.id === product._id ) {
                            isInCart = true;
                            setAlertText('Harap pisah bon karena produk sudah jadi produk gratisan');
                            setOpenErrorAlert(true);
                        }
                        // Cek jika gratisan produk sudah terdapat dalam cart
                        else if ( res._id === product.promo_id.y.product_id._id
                            && product.promo_id.x.value === 1 ) {
                            isInCart = true;
                            setAlertText('Tidak dapat menambah produk karena produk gratisan sudah'
                                + ' ada dalam keranjang belanja');
                            setOpenErrorAlert(true);
                        }
                    }
                    else {
                        // Jika produk tidak berdiskon buy x get y & sudah ada di cart
                        if ( product && res.buyxgety && res.buyxgety.id === product._id ) {
                            isInCart = true;
                            setAlertText('Harap pisah bon karena produk sudah jadi produk gratisan');
                            setOpenErrorAlert(true);
                        }
                    }
                });
                if ( product && !isInCart ) {
                    // Update kuantitas
                    product.quantity = 1;
                    setAutocompleteKey(product._id + " " + product.quantity);

                    // Cek diskon per produk
                    let localDisc = 0;
                    if ( product.promo_id ) {
                        if ( product.promo_id.type_promo === 'buyxgety' ) {
                            if ( product.promo_id.x.value === 1 ) {
                                product.buyxgety = {
                                    id: product.promo_id.y.product_id._id,
                                    name: product.promo_id.y.product_id.name,
                                    qty: parseInt(product.promo_id.y.value),
                                    price: formatToPrice(product.promo_id.y.value
                                        * product.promo_id.y.product_id.selling_price),
                                };
                            }
                        }
                        else if ( product.promo_id.type_promo === 'persen' ) {
                            localDisc = Math.ceil(unformatPrice(product.total_price)
                                * product.promo_id.value / 100);
                            product.discount = formatToPrice(localDisc);
                        }
                        else if ( product.promo_id.type_promo === 'rupiah' ) {
                            localDisc = product.promo_id.value;
                            product.discount = formatToPrice(localDisc);
                        }
                    }

                    // Cek jika sedang memakai diskon persenan
                    let total = subtotalPure - localDisc + unformatPrice(product.selling_price);
                    setSubtotalPure(total);
                    if ( currDiscount.type === 'persen' ) {
                        const currDisc = Math.ceil(total
                            * unformatPrice(currDiscount.discount) / 100);
                        let tax = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
                        setSubtotal(formatToPrice(tax));
                    }
                    else if ( currDiscount.type === 'rupiah' ) {
                        const currDisc = unformatPrice(currDiscount.discount);
                        let tax = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
                        setSubtotal(formatToPrice(tax));
                    }
                    else {
                        let tax = Math.ceil(total * (100 + taxValue) / 100);
                        setSubtotal(formatToPrice(tax));
                    }

                    // Tambahkan produk ke cart
                    result.push(product);
                    setItemList(result);
                }
                else if ( isInCart ) {
                    setAutocompleteKey(Math.random() * 100);
                }
                else {
                    setAutocompleteKey(search);
                    setAlertText('Produk tidak ditemukan!');
                    setOpenErrorAlert(true);
                }
            }
        }
    };

    // Handle product quantity by clicking +/- button
    const handleQuantity = async (type, code) => {
        let result = itemList;
        let isRemove = false;
        result.forEach(res => {
            if ( res.product_code === code ) {
                // Menambah kuantitas & harga produk di cart, dan harga akhir
                if ( type === 'plus' ) {
                    res.quantity += 1;
                    setAutocompleteKey(res._id + " " + res.quantity);
                    res.total_price = unformatPrice(res.total_price) + unformatPrice(res.selling_price);
                    res.total_price = formatToPrice(res.total_price);
                }
                else {
                    // Jika produk dikurangi tapi masih >1
                    if ( res.quantity - 1 > 0 ) {
                        res.quantity -= 1;
                        setAutocompleteKey(res._id + " " + res.quantity);
                        res.total_price = unformatPrice(res.total_price) - unformatPrice(res.selling_price);
                        res.total_price = formatToPrice(res.total_price);
                    }
                    // Jika produk dikeluarkan dari keranjang
                    else {
                        isRemove = true;
                        setAutocompleteKey(res._id + " 0");
                    }
                }

                // Cek jika ada diskon per produk
                let localDisc = 0, lastDisc = 0;
                if ( res.promo_id ) {
                    if ( res.promo_id.type_promo === 'buyxgety' ) {
                        if ( type === 'plus' && res.promo_id.x.value === res.quantity ) {
                            let isInCart = false;
                            itemList.forEach(prod => {
                                if ( prod._id === res.promo_id.y.product_id._id ) {
                                    isInCart = true;
                                    setAlertText('Tidak mendapat produk gratisan karena produk gratisan'
                                        + ' sudah ada dalam keranjang belanja');
                                    setOpenErrorAlert(true);
                                }
                            });
                            if ( !isInCart ) {
                                res.buyxgety = {
                                    id: res.promo_id.y.product_id._id,
                                    name: res.promo_id.y.product_id.name,
                                    qty: parseInt(res.promo_id.y.value),
                                    price: formatToPrice(res.promo_id.y.value
                                        * res.promo_id.y.product_id.selling_price),
                                };
                            }
                        }
                        else if ( res.promo_id.x.value > res.quantity ) {
                            res.buyxgety = false;
                        }
                    }
                    else if ( res.promo_id.type_promo === 'persen' ) {
                        lastDisc = unformatPrice(res.discount);
                        if ( isRemove ) {
                            localDisc = 0;
                            res.discount = 'Rp 0';
                        }
                        else {
                            localDisc = Math.ceil(unformatPrice(res.total_price)
                                * res.promo_id.value / 100);
                            res.discount = formatToPrice(localDisc);
                        }
                    }
                    else if ( res.promo_id.type_promo === 'rupiah' ) {
                        if ( isRemove ) {
                            lastDisc = unformatPrice(res.discount);
                            res.discount = 'Rp 0';
                        }
                        else {
                            localDisc = unformatPrice(res.promo_id.value) * res.quantity;
                            lastDisc = unformatPrice(res.discount);
                            res.discount = formatToPrice(localDisc);
                        }
                    }
                }

                // Cek jika memakai diskon apply-to-all persenan
                let total = subtotalPure + lastDisc - localDisc;
                if ( type === 'plus' ) {
                    total += unformatPrice(res.selling_price);
                }
                else {
                    total -= unformatPrice(res.selling_price);
                }
                setSubtotalPure(total);
                if ( currDiscount.type === 'persen' ) {
                    const currDisc = Math.ceil(total * unformatPrice(currDiscount.discount) / 100);
                    let tax = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
                    setSubtotal(formatToPrice(tax));
                }
                else if ( currDiscount.type === 'rupiah' ) {
                    const currDisc = unformatPrice(currDiscount.discount);
                    let tax = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
                    setSubtotal(formatToPrice(tax));
                }
                else {
                    let tax = Math.ceil(total * (100 + taxValue) / 100);
                    setSubtotal(formatToPrice(tax));
                }
            }
        });
        // Remove produk dari cart
        if ( isRemove ) {
            result = result.filter(res => res.product_code !== code);
        }
        setItemList(result);
    };

    // Remove product from list of item by clicking x button
    const removeProduct = (code) => {
        // Keluarkan produk yang dipilih dari cart
        let removedProduct = itemList.filter(res => res.product_code === code)[0];
        let result = itemList.filter(res => res.product_code !== code);
        setItemList(result);
        setAutocompleteKey(removedProduct._id + " 0");

        // Update current price milik produk yang di-remove
        removedProduct.total_price = unformatPrice(removedProduct.selling_price);
        removedProduct.total_price = formatToPrice(removedProduct.total_price);

        // Cek diskon per produk
        let lastDisc = 0;
        if ( removedProduct.promo_id ) {
            if ( removedProduct.promo_id.type_promo === 'buyxgety' ) {
                removedProduct.buyxgety = false;
            }
            else if ( removedProduct.promo_id.type_promo === 'persen'
                || removedProduct.promo_id.type_promo === 'rupiah' ) {
                lastDisc = unformatPrice(removedProduct.discount);
                removedProduct.discount = 'Rp 0';
            }
        }

        // Cek jika sedang memakai diskon persenan
        let total = 0;
        if ( currDiscount.type === 'persen' ) {
            // Membalikkan harga ke sebelum diskon lalu hitung persenannya lagi
            total = subtotalPure + lastDisc
                - (removedProduct.quantity * unformatPrice(removedProduct.selling_price));
            setSubtotalPure(total);
            const currDisc = Math.ceil(total * unformatPrice(currDiscount.discount) / 100);
            total = Math.ceil((total - currDisc) * (100 + taxValue) / 100);
        }
        else {
            // Mengurangi total harga akhir saja
            total = subtotalPure + lastDisc
                - (removedProduct.quantity * unformatPrice(removedProduct.selling_price));
            setSubtotalPure(total);
            total = Math.ceil(total  * (100 + taxValue) / 100);
        }
        setSubtotal(formatToPrice(total));
    };

    const handleOnChangeDiscount = (discount) => {
        const temp = discountOptions.filter(res => res.value === discount.value)[0];
        if ( temp.type === 'persen' ) {
            // Total harga kurangi persentase diskon
            let currPrice = subtotalPure - Math.ceil(subtotalPure
                * unformatPrice(temp.discount) / 100);
            currPrice = Math.ceil(currPrice * (100 + taxValue) / 100);
            setSubtotal(formatToPrice(currPrice));
        }
        else if ( temp.type === 'rupiah' ) {
            // Total harga kurangi harga flat diskon
            const result = unformatPrice(temp.discount);
            let tax = Math.ceil((subtotalPure - result) * (100 + taxValue) / 100);
            setSubtotal(formatToPrice(tax));
        }
        // User tidak memakai diskon
        else {
            // Tambah subtotal dengan harga diskon sebelumnya
            if ( currDiscount.type !== 'null' ) {
                let tax = Math.ceil(subtotalPure * (100 + taxValue) / 100);
                setSubtotal(formatToPrice(tax));
            }
        }
        setCurrDiscount(temp);
        setSelectedDiscount(discount.value);
    }

    const goToTransasctionDetail = () => {
        history.push({
            pathname: "/detail-transaksi",
            state: {
                itemList: itemList,
                subtotalPure: formatToPrice(subtotalPure),
                totalPrice: subtotal,
                token: token,
                currTax: currTax,
                currMethod: currMethod,
                currDiscount: currDiscount,
                paymentOptions: paymentOptions,
                paymentCategories: paymentCategs,
                selectedMethod: selectedMethod,
            }
        });
    }

    return (
        <Grid container className="main-container">
            { isLoading ? ( <Spinner /> ) : "" }
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
                <HeaderCom title="Penjualan" />
                <Grid container className="main-content">
                    <Grid item xs={7} className="left-content">
                        <Grid container>
                            <Grid item xs={12} id="search-bar">
                                <Autocomplete
                                    freeSolo
                                    key={autocompleteKey}
                                    onChange={(_, value) => {
                                        handleAddProduct(value);
                                    }}
                                    options={products.map((option) => option.title)}
                                    ref={autoRef}
                                    renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        autoFocus
                                        label="Search"
                                        placeholder="Cari produk..."
                                        margin="normal"
                                        variant="outlined"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        // InputProps={{
                                        //     ...params.InputProps,
                                        //     type: 'search',
                                        // }}
                                        // onKeyDown={e => {
                                        //     if ( e.code === 'Enter' && e.target.value ) {
                                        //         handleAddProduct(e.target.value);
                                        //     }
                                        // }}
                                    />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Grid container style={{ paddingLeft: "10px", paddingRight: "10px" }}>
                            <Grid item xs={6}>
                                <h5>Produk</h5>
                            </Grid>
                            <Grid item xs={3}>
                                <h5>Kuantitas</h5>
                            </Grid>
                            <Grid item xs={3}>
                                <h5>Harga</h5>
                            </Grid>
                        </Grid>
                        <div id="cart-items">
                        {itemList.length > 0 && itemList.map((res, idx) => {
                            return (
                                <div key={res._id}>
                                    <Grid container>
                                        <Grid item xs={5} sm={6}>
                                            <p>{res.product_code + " - " + res.name}</p>
                                        </Grid>
                                        <Grid item xs={4} sm={3} className="middle-align">
                                            <RemoveCircleOutlineIcon
                                                className="pointable"
                                                onClick={() => handleQuantity('minus', res.product_code)}
                                            />
                                            <span className="qty-text">{res.quantity}</span>
                                            <AddCircleOutlineIcon
                                                className="pointable"
                                                onClick={() => handleQuantity('plus', res.product_code)}
                                            />
                                        </Grid>
                                        <Grid item xs={2} sm={2}>
                                            <p>{res.total_price}</p>
                                        </Grid>
                                        <Grid item xs={1} sm={1} className="middle-align">
                                            <HighlightOffIcon
                                                className="pointable"
                                                style={{ marginLeft: "auto" }}
                                                onClick={() => removeProduct(res.product_code)}
                                            />
                                        </Grid>
                                    </Grid>
                                    {res.discount !== "Rp 0"?
                                        <Grid container className="item-discount">
                                            <Grid item xs={9} sm={9}>
                                                <p>Diskon</p>
                                            </Grid>
                                            <Grid item xs={2} sm={2}>
                                                <p>{res.discount}</p>
                                            </Grid>
                                            <Grid item xs={1} sm={1} className="middle-align">
                                            </Grid>
                                        </Grid> : <></>
                                    }
                                    {res.buyxgety?
                                        <Grid container className="item-discount">
                                            <Grid item xs={5} sm={6}>
                                                <p>{res.buyxgety.name}</p>
                                            </Grid>
                                            <Grid item xs={4} sm={3} className="middle-align">
                                                <RemoveCircleOutlineIcon className="zero-opacity" />
                                                <span className="qty-text">{res.buyxgety.qty}</span>
                                                <AddCircleOutlineIcon className="zero-opacity" />
                                            </Grid>
                                            <Grid item xs={2} sm={2} className="middle-align">
                                                <p>{res.buyxgety.price}</p>
                                            </Grid>
                                            <Grid item xs={1} sm={1}></Grid>
                                        </Grid> : <></>
                                    }
                                </div>
                            );
                        })}
                        </div>
                    </Grid>
                    <Grid item xs={5} className="right-content">
                        <Grid container>
                            <Grid item xs={6}>
                                <h5>{`Diskon (${currDiscount.discount})`}</h5>
                            </Grid>
                            <Grid item xs={6}>
                                <Autocomplete
                                    // size="small"
                                    disableClearable
                                    className="dropdown-discount"
                                    defaultValue={selectedDiscount}
                                    options={discountOptions}
                                    getOptionLabel={(option) => option.label}
                                    onChange={(_, value) => {
                                        handleOnChangeDiscount(value);
                                    }}
                                    disabled={itemList.length > 0 ? false : true}
                                    renderInput={(params) =>
                                        <TextField
                                            {...params}
                                            placeholder="Pilih Diskon"
                                            variant="outlined"
                                        />
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <h5>{`Pajak ${currTax.name} (${currTax.value}%)`}</h5>
                            </Grid>
                        </Grid>
                        <Grid container className="fixed-footer">
                            <Grid item xs={6}>
                                <h5>Subtotal</h5>
                            </Grid>
                            <Grid item xs={6}>
                                <h5 className="text-right">{subtotal}</h5>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    className="primary-btn full-btn thick-btn"
                                    onClick={goToTransasctionDetail}
                                >
                                    PESAN
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
