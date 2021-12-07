## Simple Electron React Boilerplate

This is a simple boilerplate to get up and running with Electron and React. It is a customized version of [Alex Devero's](https://github.com/alexdevero/electron-react-webpack-boilerplate) repo and is used in my Electron course

### Install

#### Clone this repo

```
git clone https://github.com/bradtraversy/simple-electron-react.git
```

#### Install dependencies

```
npm install
```

or

```
yarn
```

### Usage

#### Run the app

```
npm run start
```

or

```
yarn start
```

#### Build the app (automatic)

```
npm run package
```

or

```
yarn package
```

#### Build the app (manual)

```
npm run build
```

or

```
yarn build
```

#### Test the app (after `npm run build` || `yarn run build`)

```
npm run prod
```

```
yarn prod
```

### Change app title

Change the app title in the **webpack.build.config.js** and the **webpack.dev.config.js** files

## How to Install Printer

1. Install driver printer melalui applikasi '58Setup.exe' yang telah diberikan.
2. Buka 'Control Panel' melalui search window
3. Pilih menu 'Hardware and Sound'
4. Pilih menu 'Devices and Printers'
5. Klik kanan pada device bernama 'CX58D', kemudian pilih 'Properties'
6. Masuk tab 'Hardware', kemudian pilih menu 'Properties' dan masuk pada tab 'Details'
7. Pada pilihan 'Property', pilih menu bernama 'Device instance path' dan bagian 'Value' akan menampilkan sebuah teks
8. Ingatkan angka terakhir yang tertera pada teks 'Value' tersebut, misalkan 'USB001'
9. Klik tombol 'OK' untuk kembali ke halaman 'Devices and Printers'
10. Klik kanan pada device bernama 'RP58 Printer', kemudian pilih 'Printer Properties'
11. Masuk tab 'Ports', kemudian pada daftar port pilih port bernama 'USBxxx' yang telah diingat sebelumnya
12. Klik tombol 'Apply'
13. Untuk menguji jika printer telah terhubung dengan PC, masuk tab 'General' kemudian pilih menu 'Print Test Page'
14. Pastikan kabel USB printer dihubungkan pada port PC yang sama
15. Jika menggunakan port yang berbeda atau menggunakan jenis printer lain, maka langkah-langkah di atas perlu dilakukan kembali
